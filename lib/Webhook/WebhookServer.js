const http = require('http');
const textBody = require('body');
const jsonBody = require('body/json');
const { URL } = require('url');

module.exports = class WebhookServer {
    constructor (logger) {
        this.server = null;
        this.routes = [];
        this.logger = logger.child({subject: this.constructor.name});
    }

    async stop () {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('webhook server closed');
                resolve();
            });
        });
    }

    /**
     * @param {string} path (e.g., '/about')
     * @param {function} callback (e.g., (url, request, response, body) => {})
     */
    addRoute (path, callback) {
        this.routes.push({
            path,
            callback,
        });
    }

    /**
     * @param {URL} url
     * @param request
     * @param response
     * @param body
     * @private
     */
    _handleRoute (url, request, response, body) {
        for (let route of this.routes) {
            if (route.path === url.pathname) {
                route.callback(url, request, response, body);
                return true;
            }
        }
        return false;
    }

    init () {
        if (!process.env.WEBSERVER_BASE_URL || !process.env.WEBSERVER_PORT) {
            console.error('[WebhookServer] WEBSERVER_BASE_URL or WEBSERVER_PORT is not defined');
            this.logger.error('WEBSERVER_BASE_URL or WEBSERVER_PORT is not defined');
            return;
        }
        const baseUrl = process.env.WEBSERVER_BASE_URL;
        const port = process.env.WEBSERVER_PORT;
        this.server = http.createServer((request, response) => {
            const { method, url, headers } = request;
            const parsedUrl = new URL(url, baseUrl);
            this.logger.info(`incoming http request : ${method} ${url}`);

            if (headers['content-type'] && headers['content-type'].indexOf('application/json') !== -1) {
                console.log('incoming request with content-type application/json');
                jsonBody(request, response, (err, body) => {
                    if (err) {
                        response.statusCode = 500;
                        return response.end('Internal server error');
                    }

                    if (this._handleRoute(parsedUrl, request, response, body)) {
                        return;
                    }
                    console.log(body, parsedUrl, headers);

                    response.statusCode = 404;
                    return response.end();
                });
                return;
            }

            console.log('incoming request with any content-type');
            textBody(request, response, (err, body) => {
                if (err) {
                    response.statusCode = 500;
                    return response.end('Internal server error');
                }

                if (this._handleRoute(parsedUrl, request, response, body)) {
                    return;
                }

                console.log(body, parsedUrl, headers);
                response.statusCode = 404;
                return response.end();
            });
        }).listen(port);
        console.log(`webhook server is listening on port ${baseUrl}:${port}`);
    }
};
