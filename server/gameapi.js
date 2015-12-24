var MessageHandler = require('./messagehandler');
var Messages = require('../common/messages');

function GameAPI() {
  this.messageHandler = undefined;
  this.databaseProxy = undefined;

  this.players = {};  // Logged in players

  this.init();
}

GameAPI.prototype.init = function() {

  // Create and initialize database connection
  this.databaseProxy = new DatabaseProxy(this);
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
    console.log("User", websocket.username, "logged out.");
    delete this.players[websocket.username];
  }
};

GameAPI.prototype.send = function(to, msg){

  this.messageHandler.send(to, msg);
};


function DatabaseProxy(gameAPI) {

  // See https://github.com/felixge/node-mysql for more details.
  this.gameAPI = gameAPI;
  this.connection = null;

  this.init();
}

DatabaseProxy.prototype.init = function() {

  // Define database connection
  this.hostname   = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
  this.port       = 3306;
  this.user       = process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root';
  this.password   = process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'test1234';
  this.database   = "alphaworm";  // Make sure that the db name is correct
                                  // (check MySQL code)

  // Initialize database connection
  var mysql = require('mysql');

    this.connection = mysql.createConnection(
      { host: this.hostname,
        port: this.port,
        database: this.database,
        user: this.user,
        password: this.password
    });

    this.connection.connect(function(err) {
      if(!err) {
        console.log("DatabaseProxy: database connection ready");
      }
      else {
        console.log("DatabaseProxy: database connection failed:", err);
      }
  });
};

DatabaseProxy.prototype.createUser = function(websocket, msg) {
  
  console.log("DatabaseProxy.createUser", msg);

  // Generate response message
  var response = Messages.message.REGISTRATION_RESPONSE.new();
  response.username = msg.username;

  var sql = 'INSERT INTO userdata (username, password_hash) VALUES (?, ?)';
  // TODO: Prevent SQL inject (check username and password parameters)
  this.connection.query(sql, [ msg.username, msg.passwordhash ], 
      function(err, rows) {
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
    }
  );
};

DatabaseProxy.prototype.login = function(websocket, msg) {
  
  console.log("DatabaseProxy.login", msg);

  // Hook for callback(s)
  var self = this;

  // Generate response message
  var response = Messages.message.LOGIN_RESPONSE.new();
  response.username = msg.username;
  response.status = "NOK";

  // TODO: Prevent SQL injection (validate username before using it)
  if(typeof this.gameAPI.players[msg.username] === 'undefined') {
      var sql = 'SELECT password_hash FROM userdata WHERE username = ?';

      this.connection.query(sql, [ msg.username ], 
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
};

module.exports = GameAPI;
