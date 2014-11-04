  var MessageHandler = require('./messagehandler');
  var GameSession = require('./gamesession');

  var Messages = require('../common/messages');

  // Create event emitter
  var EventEmitter = require('events').EventEmitter,
  util = require('util');

  var GameAPI = function() {

    var self = this;
    self.messageHandler = undefined;
    self.databaseProxy = undefined;
    self.gameSessions = {}; // Ongoing game sessions

    self.players = {};  // Logged in players

    self.attachMessageHandler = function(messageHandler) {
      console.log("GameAPI: MessageHandler attached");
      self.messageHandler = messageHandler;
    },

    self.createUser = function(websocket, msg) {
      self.databaseProxy.createUser(websocket, msg);
    },

    self.login = function(websocket, msg) {
      self.databaseProxy.login(websocket, msg);
    },

    self.logout = function(websocket) {
      console.log("GameAPI.logout")
      if(typeof websocket.username !== 'undefined') {
        logoutPlayer(websocket.username);
      }
    },

    self.send = function(to, msg) {
      self.messageHandler.send(to, msg);
    },

    self.broadcast = function(from, msg) {
      //console.log("GameAPI.broadcast:", from, msg);
      // Iterate through connected players and send the message to each one of them
      for(var player in self.players) {
        self.messageHandler.send(self.players[player].username, msg);
      }
    },

    self.createSinglePlayerGame = function(username) {
      // Create a single player game
      // Check if user is already in game
      if(typeof self.gameSessions[username] === "undefined") {
          // Nope, create a new game
          self.gameSessions[username] = new GameSession([username], self.messageHandler, self.databaseProxy);

          // Wait for game events
          self.gameSessions[username].on('end', function(username) {
            console.log("Event GameSession.end");
            endGame(username);
          });

          startGame([username]);
        }
        else {
          // Yep, return NOK
          //console.log("User", username, "already in game.");
          return "NOK";
        }
      },

      self.createMultiplayerGame = function (playerList) {
      // Create a multiplayer game
      var newGame = null;

      // Check if users are already in game (just to make sure)
      for(var item in playerList) {
        var username = playerList[item];
        if(typeof self.gameSessions[username] !== "undefined") {
          console.log("User", username, "already in game. Dropping player from playerList");
          playerList.splice(item, 1);
          return "NOK";
        }
      }

      if(playerList) {
        newGame = new GameSession(playerList, self.messageHandler, self.databaseProxy);
          // Wait for end game event
          newGame.on('end', function(username) {
            console.log("Event GameSession.end multiplayer");
            endGame(username);
          });
        }

        for(var item in playerList) {
          var username = playerList[item];
          self.gameSessions[username] = newGame;
        }

      // Indicate state changes to other clients
      startGame(playerList);
    },

    self.userInput = function(username, input) {
      if(typeof self.gameSessions[username] !== "undefined") {
          //console.log("userInput:", username, input);
          self.gameSessions[username].userInput(username, input);
        }
      }

      /***** Internal functions - not visible outside GameAPI *****/

      var loginPlayer = function(websocket) {
        var username = websocket.username;

        self.players[username] = websocket;
        console.log("added player", username);

        // Broadcast update to all players
        var msg = Messages.message.PLAYER_LIST.new();
        msg.type = "update";

        msg.players[0].username = username;
        msg.players[0].ingame = (self.gameSessions[item]) ? true:false;
        msg.players[0].authenticated = true;

        self.broadcast(username, msg);

        // Send full playerlist to logged in player
        var broadcastmsg = Messages.message.PLAYER_LIST.new();
        broadcastmsg.type = "full";

        for(var item in self.players) {
          var player = {username: item,
            ingame: (self.gameSessions[item]) ? true:false,
            authenticated: true}
            broadcastmsg.players.push(player);
          }

          broadcastmsg.players.splice(0, 1);

          self.messageHandler.send(username, broadcastmsg);

        // Send ranking list to logged in player
        self.databaseProxy.updateRanking(username);


        console.log("Player", username, "logged in.");
      }

      var logoutPlayer = function(username) {
        console.log("GameAPI.logoutPlayer", username)

        // Disconnect from game session (if any)
        if(typeof self.gameSessions[username] !== "undefined") {
          self.gameSessions[username].disconnect(username);
        }

        // Broadcast disconnect to all players

        var msg = Messages.message.PLAYER_LIST.new();
        msg.type = "update";
        msg.players[0].username = username;
        msg.players[0].ingame = false;
        msg.players[0].authenticated = false;   // This will indicate UI that player disconnected

        self.broadcast(username, msg);

        delete self.players[username];
        console.log("Player", username, "logged out.");
        //console.log("players:", self.players);
      }

      var startGame = function(playerList) {
        // Indicate state change to other players
        var msg = Messages.message.PLAYER_LIST.new();
        msg.type = "update";

        for(var item in playerList) {   // Note: we are iterating an array
          var username = playerList[item];
          var player = {username: username,
            ingame: (self.gameSessions[username]) ? true:false,
            authenticated: (self.players[username]) ? true:false}
            msg.players.push(player);
          }
          msg.players.splice(0, 1);
          self.broadcast(username, msg);
        }

        var endGame = function(playerList) {
          console.log("GameAPI.endGame", playerList);

        // Indicate state change to other players
        var msg = Messages.message.PLAYER_LIST.new();
        msg.type = "update";

        for(var item in playerList) {   // Note: we are iterating an array
          var username = playerList[item];
          var authenticated = (self.players[username]) ? true:false;
          var player = {username: username,
            ingame: false,
            authenticated: authenticated}
            msg.players.push(player);

            //console.log("deleting game session", username);
            delete self.gameSessions[username];
          }
          msg.players.splice(0, 1);

          self.broadcast(username, msg);
        }

        var init = function() {
        // Create and initialize database connection
        self.databaseProxy = new DatabaseProxy(self);

        // Add event emitter for DatabaseProxy events
        self.databaseProxy.on('login', function(websocket) {
          console.log("Event DatabaseProxy.login");
          loginPlayer(websocket);
        });
      }

    init();
  }

var DatabaseProxy = function(gameAPI) {
  // See https://github.com/felixge/node-mysql for more details.

  var self = this;

  self.gameAPI = gameAPI;
  self.connection = null;

  self.init = function() {

    console.log("OPENSHIFT_MYSQL_DB_HOST:",process.env.OPENSHIFT_MYSQL_DB_HOST);
    console.log("OPENSHIFT_MYSQL_DB_PORT:",process.env.OPENSHIFT_MYSQL_DB_PORT);

        // Define database connection
    self.hostname   = process.env.OPENSHIFT_MYSQL_DB_HOST;
    self.port     = process.env.OPENSHIFT_MYSQL_DB_PORT;
    self.user     = process.env.OPENSHIFT_MYSQL_DB_USERNAME;
    self.password   = process.env.OPENSHIFT_MYSQL_DB_PASSWORD;
    self.database   = "alphaworm";  // Make sure that the db name is correct (check MySQL code)

    // Initialize database connection
    var mysql = require('mysql');

    self.connection = mysql.createConnection(
      { host : self.hostname,
        port : self.port,
        database: self.database,
        user : self.user,
        password : self.password
      });

    self.connection.connect(function(err) {
      if(!err) {
        console.log("DatabaseProxy: database connection ready");
      }
      else {
        console.log("DatabaseProxy: database connection failed:", err);
      }
    });
  },

  self.createUser = function(websocket, msg) {
    console.log("DatabaseProxy.createUser", msg);

    // Generate response message
    var response = Messages.message.REGISTRATION_RESPONSE.new();
    response.username = msg.username;


    // TODO: Prevent SQL inject (check username and password parameters)
    self.connection.query('INSERT INTO userdata (username, password_hash) VALUES (?, ?)', [ msg.username, msg.passwordhash ], function(err, rows) {
      if(!err) {
        console.log("DatabaseProxy: createUser succeeded");
        response.status = "OK";
      }
      else {
        console.log("DatabaseProxy: createUser failed:", err);
        response.status = "NOK";
      }
        // Send response message back to client directly through websocket
        websocket.send(JSON.stringify(response));
      });
  },

  self.login = function(websocket, msg, callback) {
    console.log("DatabaseProxy.login", msg);

    // Generate response message
    var response = Messages.message.LOGIN_RESPONSE.new();
    response.username = msg.username;
    response.status = "NOK";

    // TODO: Prevent SQL injection (validate username param before using it)
    if(typeof self.gameAPI.players[msg.username] === 'undefined') {
      self.connection.query('SELECT password_hash, username FROM userdata WHERE username = ?', [ msg.username ], function(err, rows) {
        if(!err) {
          console.log("DatabaseProxy: query ok, checking result");
          if(typeof rows[0] !== 'undefined') {
            if(rows[0].password_hash == msg.passwordhash) {
              var username = rows[0].username;
              // Valid password
              response.status = "OK";
              response.username = websocket.username = username;  // TODO: toLowerCase() ?
              self.emit('login', websocket);                    }
              }
            }
            else {
              console.log("DatabaseProxy: login failed:", err);
            }

        // Send response message back to client directly through websocket
        websocket.send(JSON.stringify(response));
      });
    }
    else {
     // Possible hacker, don't send any response? :)
    }
  },

  self.setHighscore = function(username, score) {
    console.log("DatabaseProxy.setHighscore", score, "for", username);

    self.connection.query("UPDATE userdata SET highscore=? WHERE username = ? AND ? > highscore", [ score, username, score ], function(err, rows){
      if(err != null) {
        console.log("DatabaseProxy.setHighscore failed", err);
      }
      else {
        // TODO: better ranking list handling
        console.log("DatabaseProxy.setHighscore new highscore", score, "set for", username);
        self.updateRanking('broadcast');
      }
    });
  },

  // player = username of a certain player, or 'broadcast' or '' if sent to all logged in players
  self.updateRanking = function(player) {
    console.log("DatabaseProxy.updateRanking");


    // TODO: Try to understand the magic behind the SQL spell below :)
    self.connection.query("SELECT username, highscore FROM userdata ORDER BY highscore DESC LIMIT 100", [], function(err, rows){
      if(err != null) {
        console.log("DatabaseProxy.updateRanking failed", err);
      }
      else {
        var msg = Messages.message.RANKING_LIST.new();
        msg.players = [];
        for(var item in rows) {
          msg.players.push({ username: rows[item].username, highscore: rows[item].highscore });
        }
        if(player == 'broadcast' || typeof player == 'undefined') {
          self.gameAPI.broadcast(player, msg);
        }
        else {
          self.gameAPI.send(player, msg);
        }
      }
    });
  }

self.init();
}

util.inherits(DatabaseProxy, EventEmitter);

module.exports = GameAPI;
