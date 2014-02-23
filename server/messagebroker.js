var MessageBroker = function(server) {

    // Define JavaScript scope
    var self = this;

    self.serverapp = server.serverapp;

    self.init = function() {
        console.log("MessageBroker: initializing websocket");
        var WebSocketServer = require('ws').Server;
        self.wss = new WebSocketServer({server: self.serverapp});
        
        self.wss.on('connection', function(websocket) {
            console.log("MessageBroker: client connected to port", websocket._socket.remotePort);

            // CONNECTION CLOSE
            websocket.on('close', function() {
                console.log("MessageBroker: client disconnected");
                self.logout(websocket);
            });

            // RECEIVE A MESSAGE
            websocket.on('message', function(data, flags) {
                var msg = JSON.parse(data);
                console.log("MessageBroker: received message:", msg);

                // Do some filtering at the very early phase
                if(typeof websocket.username !== 'undefined') {
                    // User has logged in, proceed the message
                    self.receive(websocket.username, msg);
                }
                else {
                    console.log("Received a message from unauthenticated user");
                    // Separate authentication process from other messages
                    self.authenticate(websocket, msg);
                }
            });
        });
    },

    self.attachMessageHandler = function(messageHandler) {
        console.log("MessageBroker: MessageHandler attached");

        self.messageHandler = messageHandler;
    },

    // Received data from Client
    self.receive = function(from, data) {

        if(self.messageHandler) {   // Make sure that MessageHandler is attached
            self.messageHandler.receive(from, data);
        }
        else {
            console.log("MessageBroker: MessageHandler is not attached");
        }
    },

    // Sending data to Client
    self.send = function(to, msg) {
        // TODO: Make sure that websocket is still open, sending to closed socket will crash the server
        var websocket = self.messageHandler.gameAPI.players[to];
        if(typeof websocket != "undefined") {
            if(require('ws').OPEN == websocket.readyState) {
                //console.log("MessageBroker.send:", msg);
                websocket.send(JSON.stringify(msg));
            }
            else {
                console.log("skipped msg as websocket is not open", msg);
            }
        }
    },

    self.authenticate = function(websocket, msg) {
        
        switch(msg.name) {
            case 'REGISTRATION_REQUEST':
                self.messageHandler.gameAPI.createUser(websocket, msg);
            break;

            case 'LOGIN_REQUEST':
                self.messageHandler.gameAPI.login(websocket, msg);
            break;

            default:
            console.log("Default branch in MessageBroker.authenticate()")
                // TODO: what to do?
            break;
        }
    },

    self.logout = function(websocket) {
        self.messageHandler.gameAPI.logout(websocket);
    }
    
    // Initialize MessageBroker when the object is created
    self.init();
}

// Make MessageBroker available outside this file
module.exports = MessageBroker;
