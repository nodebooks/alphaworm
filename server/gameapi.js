var MessageHandler = require('./messagehandler');
var DatabaseProxy = require('./databaseproxy');
var Messages = require('../common/messages');

function GameAPI() {

  this.messageHandler = undefined;
  this.databaseProxy = undefined;

  this.players = {};  // Logged in players

  this.init();

  // Internal functions (not visible outside GameAPI)
  this.loginPlayer = function(websocket) {
    console.log("loginPlayer");

    var username = websocket.username;

    this.players[username] = websocket;
    console.log("added player", username);

    // Broadcast update to all players
    var msg = Messages.message.PLAYER_LIST.new();
    msg.type = "update";
    msg.players[0].username = username;
    msg.players[0].authenticated = true;

    this.broadcast(username, msg);

    // Send full playerlist to logged in player
    var broadcastmsg = Messages.message.PLAYER_LIST.new();
    broadcastmsg.type = "full";
    delete broadcastmsg.players[0];

    for(var item in this.players) {
      var player = { username: item,
                     authenticated: true
      };
      broadcastmsg.players.push(player);
    }
    broadcastmsg.players.splice(0, 1);
    this.send(username, broadcastmsg);

    // Send ranking list to logged in player
    this.databaseProxy.updateRanking(username);

    console.log("Player", username, "logged in.");
  };

  this.logoutPlayer = function(websocket) {
    console.log("logoutPlayer");

    var username = websocket.username;

    // Broadcast disconnect to all players
    var msg = Messages.message.PLAYER_LIST.new();
    msg.type = "update";
    msg.players[0].username = username;
    msg.players[0].authenticated = false;

    this.broadcast(username, msg);
    delete this.players[username];
    console.log("Player", username, "logged out.");
  };
}

GameAPI.prototype.init = function() {
  // Create and initialize database connection
  this.databaseProxy = new DatabaseProxy(this);

  // Hook for callback
  var self = this;

  // Add event emitter for DatabaseProxy events
  this.databaseProxy.on('login', function(websocket) {
    self.loginPlayer(websocket);
  });
};

GameAPI.prototype.attachMessageHandler = function(messageHandler) {
  console.log("GameAPI: MessageHandler attached");
  this.messageHandler = messageHandler;
};

GameAPI.prototype.createUser = function(websocket, msg) {
  this.databaseProxy.createUser(websocket, msg);
};

GameAPI.prototype.login = function(websocket, msg) {
  this.databaseProxy.login(websocket, msg);
};

GameAPI.prototype.logout = function(websocket) {
  if(typeof websocket.username !== 'undefined') {
    this.logoutPlayer(websocket);
  }
};

GameAPI.prototype.send = function(to, msg){
  console.log("GameAPI.send:", msg);
  this.messageHandler.send(to, msg);
};

GameAPI.prototype.broadcast = function(from, msg) {
  console.log("GameAPI.broadcast:", msg);
  // Iterate through connected players and send the message to each one of them
  for(var player in this.players) {
    this.messageHandler.send(this.players[player].username, msg);
  }
};

module.exports = GameAPI;