function MessageBroker(messageHandler) {
  this.messageHandler = messageHandler;
  this.init();
}

MessageBroker.prototype.init = function() {
  console.log("MessageBroker started");

  // Hook for callbacks
  var self = this;

  // The websocketURI we received from the server
  console.log("websocketURI = ", websocketURI);
  this.ws = new WebSocket('ws://' + websocketURI);

  this.ws.onmessage = function (event) {
    console.log("MSG:", JSON.parse(event.data));
    self.receive(event.data);
  };

  this.ws.onerror = function (event) {
    console.log("websocket failed");
    document.getElementById('system-messages').innerHTML += 
                            "<br />Websocket failed";
  };

  this.ws.onopen = function (event) {
    console.log("websocket connected");
    document.getElementById('system-messages').innerHTML += 
                            "<br />Websocket connected";
  };

  this.ws.onclose = function (event) {
    console.log("websocket disconnected");
    document.getElementById('system-messages').innerHTML += 
                            "<br />Websocket disconnected";
  };
};

MessageBroker.prototype.receive = function(msg) {
  // Use JSON.parse() to deserialize the JavaScript object
  this.messageHandler.receive(JSON.parse(msg));
};

MessageBroker.prototype.send = function(msg) {
  // Use JSON.stringify() to serialize message to a JavaScript object
  this.ws.send(JSON.stringify(msg));
};
