const ConnectorOutput = require('./ConnectorOutput');

module.exports = class StandardConnectorOutput extends ConnectorOutput {
    write (response) {
        process.stdout.write(response);
    }
};
