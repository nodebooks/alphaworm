function MessageBroker(messageHandler) {

  this.messageHandler = messageHandler;

  this.init();
}

MessageBroker.prototype.init = function() {

  var self = this;
  console.log("MessageBroker started");

  // The websocketURI we received from the server
  console.log("websocketURI = ", websocketURI);
  this.ws = new WebSocket('ws://' + websocketURI);

  this.ws.onmessage = function (event) {
    console.log("MSG:", JSON.parse(event.data));
    self.receive(event.data);
  };

  this.ws.onerror = function (event) {
    console.log("websocket failed");
    var recv = { name: "CHAT_MESSAGE",
                 username: "System notice",
                 text: "<strong>connection failed:</strong>" + event };
    self.messageHandler.receive(recv);
  };

  this.ws.onopen = function (event) {
    console.log("websocket connected");
    var recv = { name: "CHAT_MESSAGE",
                 username: "System notice",
                 text: "<strong>connection established.</strong>" };
    self.messageHandler.receive(recv);
  };

  this.ws.onclose = function (event) {
    console.log("websocket disconnected");
    var recv = { name: "CHAT_MESSAGE",
                 username: "System notice",  
                 text: "<strong>disconnected</strong>" };
    self.messageHandler.receive(recv);

  };
},

MessageBroker.prototype.receive = function(msg) {
  // JSON.parse creates a JavaScript object
  this.messageHandler.receive(JSON.parse(msg));
},

MessageBroker.prototype.send = function(msg) {
  // JSON.stringify serialises a JavaScript object 
  // (i.e. makes object a string)
  this.ws.send(JSON.stringify(msg));
}
