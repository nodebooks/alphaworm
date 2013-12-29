var GameAPI = require('./gameapi');

var MessageHandler = function() {

    var self = this;
    self.gameAPI = undefined;
    self.messageBroker = undefined;

    self.attachGameAPI = function(gameAPI) {
    	console.log("MessageHandler: GameAPI attached");

        self.gameAPI = gameAPI;
    },
    
    self.attachMessageBroker = function(messageBroker) {
    	console.log("MessageHandler: MessageBroker attached");

        self.messageBroker = messageBroker;
    },

    self.receive = function(from, msg) {

        switch (msg.name) {

            case 'CHAT_MESSAGE':
            break;

            default:
                console.log("MessageHandler.receive: default branch reached for msg", msg.name);
            break;
        }
    },

    self.send = function(to, msg) {
    	self.messageBroker.send(to, msg);
    }
}

module.exports = MessageHandler;
