var MessageHandler = require('./messagehandler');
var Messages = require('../common/messages');

var GameAPI = function() {

  var self = this;
  self.messageHandler = undefined;
  self.databaseProxy = undefined;

  self.players = {};  // Logged in players

  self.init = function() {
    
    // Create and initialize database connection
    self.databaseProxy = new DatabaseProxy(self);
  },

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

    if(typeof websocket.username !== 'undefined') {
      console.log("User", websocket.username, "logged out.");
      delete self.players[websocket.username];
    }
  },

  self.send = function(to, msg){

    self.messageHandler.send(to, msg);
  }

  self.init();
}

var DatabaseProxy = function(gameAPI) {
  // See https://github.com/felixge/node-mysql for more details.

  var self = this;

  self.gameAPI = gameAPI;
  self.connection = null;

  self.init = function() {

    // Define database connection
    self.hostname   = process.env.OPENSHIFT_MYSQL_DB_HOST;
    self.port     = 3306;
    self.user     = process.env.OPENSHIFT_MYSQL_DB_USERNAME;
    self.password   = process.env.OPENSHIFT_MYSQL_DB_PASSWORD;
    self.database   = "alphaworm";  // Make sure that the db name is correct (check MySQL code)

    // Initialize database connection
    var mysql = require('mysql');

      self.connection = mysql.createConnection(
        { host: self.hostname,
          port: self.port,
          database: self.database,
          user: self.user,
          password: self.password
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

  self.login = function(websocket, msg) {
    console.log("DatabaseProxy.login", msg);

    // Generate response message
    var response = Messages.message.LOGIN_RESPONSE.new();
    response.username = msg.username;
    response.status = "NOK";

    // TODO: Prevent SQL injection (validate username before using it)
    if(typeof self.gameAPI.players[msg.username] === 'undefined') {
        self.connection.query('SELECT password_hash FROM userdata WHERE username = ?', [ msg.username ], 
        function(err, rows) {
          if(!err) {
            console.log("DatabaseProxy: query ok, checking result");
            if(typeof rows[0] !== 'undefined') {
              if(rows[0].password_hash == msg.passwordhash) {
                // Valid password
                response.status = "OK";
                websocket.username = msg.username;
                self.gameAPI.players[msg.username] = websocket;
              }
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
  }

    self.init();
}

module.exports = GameAPI;
