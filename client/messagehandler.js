var MessageHandler = function(game) {

  var self = this;
  self.messageBroker = undefined;

  self.init = function() {
    console.log("MessageHandler started");
  },

  self.attachBroker = function(messageBroker) {
    console.log("MessageHandler: messageBroker attached.")
    self.messageBroker = messageBroker;
  }

  self.init();
}