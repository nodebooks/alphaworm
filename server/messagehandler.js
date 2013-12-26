var gameapi = require('./gameapi');

var MessageHandler = function() {

    var self = this;
    self.gameAPI = undefined;
    self.messageBroker = undefined;

    self.attachGameAPI = function(gameAPI) {
        self.gameAPI = gameAPI;
    },
    
    self.attachMessageBroker = function(messageBroker) {
        self.messageBroker = messageBroker;
    }
}

module.exports = MessageHandler;
