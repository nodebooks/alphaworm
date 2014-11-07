function MessageBroker(messageHandler) {

  this.messageHandler = messageHandler;

  this.init();
}

MessageBroker.prototype.init = function() {
  console.log("MessageBroker started");

  // Hook for callback(s)
  var self = this;

  // The websocketURI we received from the server
  console.log("websocketURI = ", websocketURI);
  this.ws = new WebSocket('ws://' + websocketURI);

  this.ws.onmessage = function (event) {
    self.receive(event.data);
  };

  this.ws.onerror = function (event) {
    console.log("websocket failed");
    self.messageHandler.receive({name: "CHAT_MESSAGE",
      username: "System notice",
      text: "<strong>could not connect websocket</strong>"});
  };

  this.ws.onopen = function (event) {
    console.log("websocket connected");
    self.messageHandler.receive({name: "CHAT_MESSAGE",
      username: "System notice",
      text: "<strong>connection established.</strong>"});
  };

  this.ws.onclose = function (event) {
    console.log("websocket disconnected");
    self.messageHandler.receive({name: "CHAT_MESSAGE",
      username: "System notice",  
      text: "<strong>disconnected</strong>"});

  };
},

MessageBroker.prototype.receive = function(msg) {
  // Use JSON.parse() to deserialize the JavaScript object
  this.messageHandler.receive(JSON.parse(msg));
},

MessageBroker.prototype.send = function(msg) {
  // Use JSON.stringify() to serialize JavaScript object
  this.ws.send(JSON.stringify(msg));
}
