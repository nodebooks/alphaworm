var MessageHandler = require('./messagehandler');

function GameAPI() {
  this.messageHandler = undefined;
}

GameAPI.prototype.attachMessageHandler = function(messageHandler) {
  this.messageHandler = messageHandler;
};

module.exports = GameAPI;
