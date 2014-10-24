#!/bin/env node

var MessageBroker = require('./server/messagebroker');
var MessageHandler = require('./server/messagehandler');
var GameAPI = require('./server/gameapi');

var GameServer = function() {

  // A trick to set scope in JavaScript
  var self = this;

  // Setup server variables
  self.setupVariables = function() {
    //  Environment variables for the OpenShift app
    self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
    self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
    
    // Applications domain name and port client shall connect
    self.domain    = process.env.OPENSHIFT_APP_DNS; 
    self.clientport = 8000;
  };

  self.init = function() {
    console.log("Initialising server...");
    var http = require('http'),
    express = require('express');
    self.app = express();

    // Pass the websocket information to the client
    self.app.use('/websocketURI.js', function(req, res) {
      var port = 8000;
      console.log("OPENSHIFT_APP_DNS = ", process.env.OPENSHIFT_APP_DNS);
      // Modify the URI only if we pass an optional connection port in.
      var websocketURI = process.env.OPENSHIFT_APP_DNS + ':' + self.clientport;
      console.log("websocketURI = ", websocketURI);
      res.set('Content-Type', 'text/javascript');
      res.send('var websocketURI="' + websocketURI + '";');
    });

    // Enable some directories for browsers
    self.app.use('/client', express.static(__dirname + '/client'));
    self.app.use('/common', express.static(__dirname + '/common'));
    self.app.use('/media', express.static(__dirname + '/media'));

    // Return index.html to browsers
    self.app.get('/', function(req, res) {
      console.log("loading index.html");
      res.sendfile('index.html');
    });

    // Create server application (express.js)
    self.serverapp = http.createServer(self.app);
    self.serverapp.listen(self.port, self.ipaddress);
    console.log("game server running @ ", self.ipaddress, ":", self.port);

    // Create server objects
    self.messageBroker = new MessageBroker(self);
    self.messageHandler = new MessageHandler();
    self.gameAPI = new GameAPI();
    self.gameServer = new GameAPI(self.messageHandler);

    // Link the objects:
    // Incoming: MessageBroker -> MessageHandler -> GameAPI
    self.messageBroker.attachMessageHandler(self.messageHandler);
    self.messageHandler.attachGameAPI(self.gameAPI);

    // Outgoing: GameAPI -> MessageHandler -> MessageBroker
    self.gameAPI.attachMessageHandler(self.messageHandler);
    self.messageHandler.attachMessageBroker(self.messageBroker);

    console.log("game server started");
  }
  
  // Set some internal variables
  self.setupVariables();

  // Call tnitialize and start server, when the server object is created
  self.init();
}

// Create the game server
var gameServer = new GameServer();