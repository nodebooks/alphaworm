var MessageBroker = function(messageHandler) {

  var self = this;
  self.messageHandler = messageHandler;

  self.init = function() {
    console.log("MessageBroker started");

    // The websocketURI we received from the server
    console.log("websocketURI = ", websocketURI);
    self.ws = new WebSocket('ws://' + websocketURI);

    self.ws.onmessage = function (event) {
      console.log("MSG:", JSON.parse(event.data));
      self.receive(event.data);
    };

    self.ws.onerror = function (event) {
      console.log("websocket failed");
      document.getElementById('system-messages').innerHTML += "<br />Websocket failed";
    };

    self.ws.onopen = function (event) {
      console.log("websocket connected");
      document.getElementById('system-messages').innerHTML += "<br />Websocket connected";
    };

    self.ws.onclose = function (event) {
      console.log("websocket disconnected");
      document.getElementById('system-messages').innerHTML += "<br />Websocket disconnected";

    };
  },

  self.receive = function(msg) {
    // Use JSON.parse() to deserialize the JavaScript object
    self.messageHandler.receive(JSON.parse(msg));
  },

  self.send = function(msg) {
    // Use JSON.stringify() to serialize message to a JavaScript object
    self.ws.send(JSON.stringify(msg));
  }

  self.init();
}