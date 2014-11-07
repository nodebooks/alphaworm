function MessageBroker(server) {

  this.clients  = {}; // Index with username
  this.serverapp = server.serverapp;  
  // Initialize MessageBroker when the object is created
  this.init();
}

MessageBroker.prototype.init = function() {
  
  // Save scope for websocket event handling
  var self = this;
  console.log("MessageBroker: initializing websocket");
  var WebSocketServer = require('ws').Server;
  this.wss = new WebSocketServer({server: this.serverapp});

  this.wss.on('connection', function(websocket) {
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

MessageBroker.prototype.attachMessageHandler = function(messageHandler) {
  console.log("MessageBroker: MessageHandler attached");
  this.messageHandler = messageHandler;
},

// Received data from Client
MessageBroker.prototype.receive = function(from, data) {

  if(this.messageHandler) {   // Make sure that MessageHandler is attached
    this.messageHandler.receive(from, data);
  }
  else {
    console.log("MessageBroker: MessageHandler is not attached");
  }
},

// Sending data to Client
MessageBroker.prototype.send = function(to, msg) {
  // TODO: Make sure that websocket is still open, sending to closed socket will crash the server
  var stringified_msg = JSON.stringify(msg);
  var websocket = this.clients[to.toLowerCase()];
  
  websocket.send(stringified_msg);
},

MessageBroker.prototype.authenticate = function(websocket, msg) {

  switch(msg.name) {
    case 'REGISTRATION_REQUEST':
    this.messageHandler.gameAPI.createUser(websocket, msg);
    break;

    case 'LOGIN_REQUEST':
    this.messageHandler.gameAPI.login(websocket, msg);
    break;

    default:
    // TODO: what to do?
    break;
  }
},

MessageBroker.prototype.logout = function(websocket) {
  this.messageHandler.gameAPI.logout(websocket);
}

// Make MessageBroker available outside this file
module.exports = MessageBroker;
