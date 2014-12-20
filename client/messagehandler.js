function MessageHandler(game) {
  this.messageBroker = undefined;
  this.init();
}

MessageHandler.prototype.init = function() {
  console.log("MessageHandler started");
},

MessageHandler.prototype.attachBroker = function(messageBroker) {
  console.log("MessageHandler: messageBroker attached.");
  this.messageBroker = messageBroker;
}