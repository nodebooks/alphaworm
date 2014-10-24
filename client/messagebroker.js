var MessageBroker = function() {

  var self = this;
  self.messageHandler = undefined;

  self.init = function() {
    console.log("MessageBroker started");

    // The websocketURI we received from the server
    console.log("websocketURI = ", websocketURI);
    self.ws = new WebSocket('ws://' + websocketURI);

    self.ws.onmessage = function (event) {
      console.log("received message:", event);
      document.getElementById('system-messages').innerHTML += "<br />Received message:", JSON.parse(event.data);
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

  self.attachHandler = function(messageHandler) {
    self.messageHandler = messageHandler;
  },

  self.init();
}