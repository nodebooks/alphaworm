function MessageBroker(server) {
  this.clients  = {}; // Index with username
  this.serverapp = server.serverapp;  
  // Initialize MessageBroker when the object is created
  this.init();
}

MessageBroker.prototype.init = function() {
  console.log("MessageBroker: initializing websocket");
  var WebSocketServer = require('ws').Server;
  this.wss = new WebSocketServer({server: this.serverapp});

  this.wss.on('connection', function(websocket) {
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
};

MessageBroker.prototype.attachMessageHandler = function(messageHandler) {
  this.messageHandler = messageHandler;
  console.log("MessageBroker: MessageHandler attached");
};

// Make MessageBroker available outside this file
module.exports = MessageBroker;
