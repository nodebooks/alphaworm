var MessageBroker = function(server) {

  // Define JavaScript scope
  var self = this;

  self.clients  = {}; // Index with username
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
      });

      // RECEIVE A MESSAGE
      websocket.on('message', function(data, flags) {
        console.log("MessageBroker: received message:", JSON.parse(data));
      });
    });
  },

  self.attachMessageHandler = function(messageHandler) {
    self.messageHandler = messageHandler;
    console.log("MessageBroker: MessageHandler attached");
  }
  
  // Initialize MessageBroker when the object is created
  self.init();
}

// Make MessageBroker available outside this file
module.exports = MessageBroker;
