var MessageBroker = function(messageHandler) {

  var self = this;
  self.messageHandler = messageHandler;

  self.init = function() {
    console.log("MessageBroker started");

    // The websocketURI we received from the server
    console.log("websocketURI = ", websocketURI);
    self.ws = new WebSocket('ws://' + websocketURI);

    self.ws.onmessage = function (event) {
      self.receive(event.data);
    };

    self.ws.onerror = function (event) {
      console.log("websocket failed");
      self.messageHandler.receive({name: "CHAT_MESSAGE",
                                   username: "System notice",
                                   text: "<strong>could not connect websocket</strong>"});
    };

    self.ws.onopen = function (event) {
      console.log("websocket connected");
      self.messageHandler.receive({name: "CHAT_MESSAGE",
                                   username: "System notice",
                                   text: "<strong>connection established.</strong>"});
    };

    self.ws.onclose = function (event) {
      console.log("websocket disconnected");
      self.messageHandler.receive({name: "CHAT_MESSAGE",
                                   username: "System notice",  
                                   text: "<strong>disconnected</strong>"});
    };
  },

  self.receive = function(msg) {
    // Use JSON.parse() to deserialize the JavaScript object
    self.messageHandler.receive(JSON.parse(msg));
  },

  self.send = function(msg) {
    // Use JSON.stringify() to serialize JavaScript object
    self.ws.send(JSON.stringify(msg));
  }

  self.init();
}