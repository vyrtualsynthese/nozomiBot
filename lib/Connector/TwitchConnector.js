const tmi = require('tmi.js');

const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: process.env.TWITCH_BOT_USER,
        password: process.env.TWITCH_BOT_OAUTH
    },
    channels: ['#ashuvidz']
};

const client = new tmi.Client(options);

// Connect the client to the server..
client.connect();

client.on('message', (channel, userstate, message, self) => {
    if (self) return;

    switch (userstate['message-type']) {
        case 'action':
            break;
        case 'chat':
            console.log(`Sur le chan ${channel} par le user : ${userstate.username} le message : ${message}`);
            break;
        case 'whisper':
            break;
        default :
            break;
    }
});
