var tmi = require("tmi.js");

var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "aoinozomibot",
        password: "oauth:a29b68aede41e25179a66c5978b21437"
    },
    channels: ["#schmoopiie"]
};

var client = new tmi.client(options);

// Connect the client to the server..
client.connect();

