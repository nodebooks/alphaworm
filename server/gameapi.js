var MessageHandler = require('./messagehandler');

var GameAPI = function() {

    var self = this;
    self.messageHandler = undefined;

    self.attachMessageHandler = function(messageHandler) {
        self.messageHandler = messageHandler;
    }
}

module.exports = GameAPI;
