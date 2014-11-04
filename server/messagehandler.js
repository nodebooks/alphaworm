var GameAPI = require('./gameapi');

var MessageHandler = function() {

  var self = this;
  self.gameAPI = undefined;
  self.messageBroker = undefined;

  self.attachGameAPI = function(gameAPI) {
    console.log("MessageHandler: GameAPI attached");
    self.gameAPI = gameAPI;
  },

  self.attachGameServer = function(gameServer) {
    console.log("MessageHandler: GameServer attached");
    self.gameServer = gameServer;
  },

  self.attachMessageBroker = function(messageBroker) {
    console.log("MessageHandler: MessageBroker attached");
    self.messageBroker = messageBroker;
  },

  self.receive = function(from, msg) {

    switch (msg.name) {

      case 'CHAT_MESSAGE':
      self.gameAPI.broadcast(from, msg);
      break;

      case 'START_SINGLEPLAYER_GAME_REQ':
      console.log("START_SINGLEPLAYER_GAME_REQ from user:", from);
      self.gameAPI.createSinglePlayerGame(from, msg);
      break;

      case 'USER_INPUT':
      self.gameAPI.userInput(from, msg.direction);
      break;

      case 'DISCONNECT_REQ':
      console.log("MessageHandler: DISCONNECT_REQ from", msg.username);
      self.gameAPI.userData(from, msg);
      // Send update to clients
      self.removeFromPlayerList(msg.username);
      self.sendSystemMessage(msg.username + " disconnected.");
      break;

      case 'CHALLENGE_REQ':
      self.handleChallengeRequest(from, msg);
      break;

      case 'CHALLENGE_RESP':
      self.handleChallengeResponse(from, msg);
      break;

      default:
      console.log("MessageHandler.receive: default branch reached for msg", msg.name);
      break;
    }
  },

  self.send = function(to, msg) {
    //console.log("MessageHandler.send:", msg);
    self.messageBroker.send(to, msg);
  },

  self.handleChallengeRequest = function(from, msg) {

    // Route challenge request to challenged player
    if(msg.challenger == from) {
      self.send(msg.challengee, msg);
    }
    else {
      console.log("MessageHandler.handleChallengeRequest malformed CHALLENGE_REQ", msg);
    }
  },

  self.handleChallengeResponse = function(from, msg) {
    // If challenge is accepted, create multiplayer game
    if(msg.response == "OK") {
      var playerList = [msg.challengee, msg.challenger];
      self.gameAPI.createMultiplayerGame(playerList);
    }
  }
}

module.exports = MessageHandler;
