function MessageHandler() {
  this.gameAPI = undefined;
  this.messageBroker = undefined;
}

MessageHandler.prototype.attachGameAPI = function(gameAPI) {
  this.gameAPI = gameAPI;
},

MessageHandler.prototype.attachMessageBroker = function(messageBroker) {
  this.messageBroker = messageBroker;
}

module.exports = MessageHandler;
