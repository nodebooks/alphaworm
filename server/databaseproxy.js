var Messages = require('../common/messages');

// Create event emitter
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function DatabaseProxy(gameAPI) {
  // See https://github.com/felixge/node-mysql for more details.
  this.gameAPI = gameAPI;
  this.connection = null;

  this.init();
}

util.inherits(DatabaseProxy, EventEmitter);

DatabaseProxy.prototype.init = function() {
  console.log("DatabaseProxy init");

  // Define database connection
  this.hostname   = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
  this.port       = 3306;
  this.user       = process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root';
  this.password   = process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'test1234';
  this.database   = "alphaworm";  // Make sure that the db name is correct (check MySQL code)

  // Initialize database connection
  var mysql = require('mysql');

  this.connection = mysql.createConnection(
    { host : this.hostname,
      port : this.port,
      database: this.database,
      user : this.user,
      password : this.password
    });

  this.connection.connect(function(err) {
    if(!err) {
      console.log("DatabaseProxy: database connection ready");
    }
    else {
      console.log("DatabaseProxy: database connection failed:", err);
    }
  });
},

DatabaseProxy.prototype.createUser = function(websocket, msg) {
  console.log("DatabaseProxy.createUser", msg);

  // Generate response message
  var response = Messages.message.REGISTRATION_RESPONSE.new();
  response.username = msg.username;

  // TODO: Prevent SQL inject (check username and password parameters)
  this.connection.query('INSERT INTO userdata (username, password_hash) VALUES (?, ?)', 
                       [ msg.username, msg.passwordhash ], function(err, rows) {
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

DatabaseProxy.prototype.login = function(websocket, msg) {
  console.log("DatabaseProxy.login", msg);

  // Hook for callbacks
  var self = this;

  // Generate response message
  var response = Messages.message.LOGIN_RESPONSE.new();
  response.username = msg.username;
  response.status = "NOK";

  // TODO: Prevent SQL injection (validate username param before using it)
  if(typeof this.gameAPI.players[msg.username] === 'undefined') {
    this.connection.query('SELECT password_hash, username FROM userdata WHERE username = ?', [ msg.username ], function(err, rows) {
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

DatabaseProxy.prototype.setHighscore = function(username, score) {
  console.log("DatabaseProxy.setHighscore", score, "for", username);

  // Hook for callbacks
  var self = this;

  this.connection.query("UPDATE userdata SET highscore=? WHERE username = ? AND ? > highscore", [ score, username, score ], function(err, rows){
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
DatabaseProxy.prototype.updateRanking = function(player) {
  console.log("DatabaseProxy.updateRanking");

  // Hook for callbacks
  var self = this;

  // TODO: Try to understand the magic behind the SQL spell below :)
  this.connection.query("SELECT username, highscore FROM userdata ORDER BY highscore DESC LIMIT 100", [], function(err, rows){
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

module.exports = DatabaseProxy;