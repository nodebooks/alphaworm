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
      var recv = { name: "CHAT_MESSAGE",
                   username: "System notice",
                   text: "<strong>connection failed:</strong>" + event };
      self.messageHandler.receive(recv);
    };

    self.ws.onopen = function (event) {
      console.log("websocket connected");
      var recv = { name: "CHAT_MESSAGE",
                   username: "System notice",
                   text: "<strong>connection established.</strong>" };
      self.messageHandler.receive(recv);
    };

    self.ws.onclose = function (event) {
      console.log("websocket disconnected");
      var recv = { name: "CHAT_MESSAGE",
                   username: "System notice",  
                   text: "<strong>disconnected</strong>" };
      self.messageHandler.receive(recv);

    };
  },

  self.receive = function(msg) {
    // JSON.parse creates a JavaScript object
    self.messageHandler.receive(JSON.parse(msg));
  },

  self.send = function(msg) {
    // JSON.stringify serialises a JavaScript object 
    // (i.e. makes object a string)
    self.ws.send(JSON.stringify(msg));
  }

  self.init();
}