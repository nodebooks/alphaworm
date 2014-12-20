var gameapi = require('./gameapi');

function MessageHandler() {

  this.gameAPI = undefined;
  this.messageBroker = undefined;
}

MessageHandler.prototype.attachGameAPI = function(gameAPI) {

  console.log("MessageHandler: GameAPI attached");
  this.gameAPI = gameAPI;
};

MessageHandler.prototype.attachMessageBroker = function(messageBroker) {

  console.log("MessageHandler: MessageBroker attached");
  this.messageBroker = messageBroker;
};

MessageHandler.prototype.receive = function(from, msg) {

  switch (msg.name) {
    case 'CHAT_MESSAGE':
    //TODO: Add support in Iteration Three
    break;

    default:
    console.log("MessageHandler.receive: default branch reached for msg", msg.name);
    break;
  }
};

MessageHandler.prototype.send = function(to, msg) {

  this.messageBroker.send(to, msg);
};
  
module.exports = MessageHandler;
