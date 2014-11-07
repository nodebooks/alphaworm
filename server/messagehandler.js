var GameAPI = require('./gameapi');

function MessageHandler() {

  this.gameAPI = undefined;
  this.messageBroker = undefined;
}

MessageHandler.prototype.attachGameAPI = function(gameAPI) {
  console.log("MessageHandler: GameAPI attached");
  this.gameAPI = gameAPI;
},

MessageHandler.prototype.attachGameServer = function(gameServer) {
  console.log("MessageHandler: GameServer attached");
  this.gameServer = gameServer;
},

MessageHandler.prototype.attachMessageBroker = function(messageBroker) {
  console.log("MessageHandler: MessageBroker attached");
  this.messageBroker = messageBroker;
},

MessageHandler.prototype.receive = function(from, msg) {

  switch (msg.name) {
    case 'CHAT_MESSAGE':
    this.gameAPI.broadcast(from, msg);
    break;

    case 'START_SINGLEPLAYER_GAME_REQ':
    console.log("START_SINGLEPLAYER_GAME_REQ from user:", from);
    this.gameAPI.createSinglePlayerGame(from, msg);
    break;

    case 'USER_INPUT':
    this.gameAPI.userInput(from, msg.direction);
    break;

    case 'DISCONNECT_REQ':
    console.log("MessageHandler: DISCONNECT_REQ from", msg.username);
    this.gameAPI.userData(from, msg);
    // Send update to clients
    this.removeFromPlayerList(msg.username);
    this.sendSystemMessage(msg.username + " disconnected.");
    break;

    case 'CHALLENGE_REQ':
    this.handleChallengeRequest(from, msg);
    break;

    case 'CHALLENGE_RESP':
    this.handleChallengeResponse(from, msg);
    break;

    default:
    console.log("MessageHandler.receive: default branch reached for msg", msg.name);
    break;
  }
},

MessageHandler.prototype.send = function(to, msg) {
  //console.log("MessageHandler.send:", msg);
  this.messageBroker.send(to, msg);
},

MessageHandler.prototype.handleChallengeRequest = function(from, msg) {

  // Route challenge request to challenged player
  if(msg.challenger == from) {
    this.send(msg.challengee, msg);
  }
  else {
    console.log("MessageHandler.handleChallengeRequest malformed CHALLENGE_REQ", msg);
  }
},

MessageHandler.prototype.handleChallengeResponse = function(from, msg) {
  // If challenge is accepted, create multiplayer game
  if(msg.response == "OK") {
    var playerList = [msg.challengee, msg.challenger];
    this.gameAPI.createMultiplayerGame(playerList);
  }
}

module.exports = MessageHandler;
