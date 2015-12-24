var MessageHandler = require('./messagehandler');
var DatabaseProxy = require('./databaseproxy');
var GameSession = require('./gamesession');
var Messages = require('../common/messages');

function GameAPI() {

  this.messageHandler = undefined;
  this.databaseProxy = undefined;
  this.gameSessions = {}; // Ongoing game sessions

  this.players = {};  // Logged in players

  this.init();

  this.loginPlayer = function(websocket) {
    var username = websocket.username;

    this.players[username] = websocket;
    console.log("added player", username);

    // Broadcast update to all players
    var msg = Messages.message.PLAYER_LIST.new();
    msg.type = "update";

    msg.players[0].username = username;
    msg.players[0].ingame = (this.gameSessions[item]) ? 
                             true:false;
    msg.players[0].authenticated = true;

    this.broadcast(username, msg);

    // Send full playerlist to logged in player
    var broadcastmsg = Messages.message.PLAYER_LIST.new();
    broadcastmsg.type = "full";

    for(var item in this.players) {
      var player = {
        username: item,
        ingame: (this.gameSessions[item]) ? true:false,
        authenticated: true};
        broadcastmsg.players.push(player);
      }

      broadcastmsg.players.splice(0, 1);

      this.messageHandler.send(username, broadcastmsg);

    // Send ranking list to logged in player
    this.databaseProxy.updateRanking(username);


    console.log("Player", username, "logged in.");
  };

  this.logoutPlayer = function(username) {
    console.log("GameAPI.logoutPlayer", username);

    // Disconnect from game session (if any)
    if(typeof this.gameSessions[username] !== "undefined") {
      this.gameSessions[username].disconnect(username);
    }

    // Broadcast disconnect to all players

    var msg = Messages.message.PLAYER_LIST.new();
    msg.type = "update";
    msg.players[0].username = username;
    msg.players[0].ingame = false;
    // This will indicate UI that player disconnected
    msg.players[0].authenticated = false;   

    this.broadcast(username, msg);

    delete this.players[username];
    console.log("Player", username, "logged out.");
    //console.log("players:", this.players);
  };

  this.startGame = function(playerList) {
    // Indicate state change to other players
    var msg = Messages.message.PLAYER_LIST.new();
    msg.type = "update";
    var username;

    for(var item in playerList) {
      username = playerList[item];
      var player = { 
        username: username,
        ingame: (this.gameSessions[username]) ? true:false,
        authenticated: (this.players[username]) ? true:false
      };
      msg.players.push(player);
    }
    msg.players.splice(0, 1);
    this.broadcast(username, msg);
  };

  this.endGame = function(playerList) {
    console.log("GameAPI.endGame", playerList);
    // Indicate state change to other players
    var msg = Messages.message.PLAYER_LIST.new();
    msg.type = "update";
    var username;

    for(var item in playerList) {   
      username = playerList[item];
      var authenticated = (this.players[username]) ? true:false;
      var player = { username: username,
        ingame: false,
        authenticated: authenticated
      };
      msg.players.push(player);

      //console.log("deleting game session", username);
      delete this.gameSessions[username];
      }
      msg.players.splice(0, 1);

      this.broadcast(username, msg);
  };
}

GameAPI.prototype.init = function() {
  console.log("GameAPI init");

  // Hook for callback
  var self = this;

  // Create and initialize database connection
  this.databaseProxy = new DatabaseProxy(this);

  // Add event emitter for DatabaseProxy events
  this.databaseProxy.on('login', function(websocket) {
    console.log("Event DatabaseProxy.login");
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
  console.log("GameAPI.logout");
  if(typeof websocket.username !== 'undefined') {
    this.logoutPlayer(websocket.username);
  }
};

GameAPI.prototype.send = function(to, msg) {
  this.messageHandler.send(to, msg);
};

GameAPI.prototype.broadcast = function(from, msg) {
  console.log("GameAPI.broadcast:", from, msg);
  // Iterate through connected players and 
  // send the message to each one of them
  for(var player in this.players) {
    this.messageHandler.send(this.players[player].username, msg);
  }
};

GameAPI.prototype.createSinglePlayerGame = function(username) {
  // Create a single player game

  // Hook for callback
  var self = this;

  // Check if user is already in game
  if(typeof this.gameSessions[username] === "undefined") {
    // Nope, create a new game
    this.gameSessions[username] = new GameSession([username], 
                    this.messageHandler, this.databaseProxy);

    // Wait for game events
    this.gameSessions[username].on('end', function(username) {
      console.log("Event GameSession.end");
      self.endGame(username);
    });

    this.startGame([username]);
  }
  else {
    // Yep, return NOK
    //console.log("User", username, "already in game.");
    return "NOK";
  }
};

GameAPI.prototype.createMultiplayerGame = function (playerList) {
  // Create a multiplayer game
  var newGame = null;

  // Hook for callback
  var self = this;
  var username;
  // Check if users are already in game (just to make sure)
  for(var item in playerList) {
    username = playerList[item];
    if(typeof this.gameSessions[username] !== "undefined") {
      console.log("User", username, "already in game.");
      playerList.splice(item, 1);
      return "NOK";
    }
  }

  if(playerList) {
    newGame = new GameSession(playerList, this.messageHandler, 
                              this.databaseProxy);
      // Wait for end game event
      newGame.on('end', function(username) {
        console.log("Event GameSession.end multiplayer");
        self.endGame(username);
      });
    }

    for(var index in playerList) {
      username = playerList[index];
      this.gameSessions[username] = newGame;
    }

  // Indicate state changes to other clients
  this.startGame(playerList);
};

GameAPI.prototype.userInput = function(username, input) {
  if(typeof this.gameSessions[username] !== "undefined") {
      //console.log("userInput:", username, input);
      this.gameSessions[username].userInput(username, input);
  }
};

module.exports = GameAPI;
