module.exports = class ConnectorIO {
    constructor (input, output) {
        this.input = input;
        this.output = output;
    }

    async readCommand () {
        return this.input.read();
    }

    writeResponse (response) {
        this.output.write(response);
    }
};
