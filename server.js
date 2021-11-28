#!/bin/env node

var MessageBroker = require('./server/messagebroker');
var MessageHandler = require('./server/messagehandler');
var GameAPI = require('./server/gameapi');

function GameServer() {

  // Set some internal variables
  this.setupVariables();

  // Call tnitialize and start server, when the server object is created
  this.init();
}

GameServer.prototype.setupVariables = function() {
  //  Environment variables for the OpenShift app
  this.ipaddress  = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
  this.port       = process.env.OPENSHIFT_NODEJS_PORT || 8080;
  // Applications domain name and port client shall connect
  this.domain     = process.env.OPENSHIFT_APP_DNS || '127.0.0.1';
  // Use websocket port 8000 in OpenShift, otherwise port 8080
  this.clientport = (process.env.OPENSHIFT_NODEJS_IP) ? 8000:8080;
}

GameServer.prototype.init = function() {
  console.log("Initialising server...");
  var http = require('http'),
  express = require('express');
  this.app = express();

  // Pass the websocket information to the client
  this.app.use('/websocketURI.js', function(req, res) {
    console.log("domain = ", gameServer.domain, "port:", gameServer.clientport);

    var websocketURI = gameServer.domain + ':' + gameServer.clientport;
    console.log("websocketURI = ", websocketURI);
    res.set('Content-Type', 'text/javascript');
    res.send('var websocketURI="' + websocketURI + '";');
  });

  // Enable some directories for browsers
  this.app.use('/client', express.static(__dirname + '/client'));
  this.app.use('/common', express.static(__dirname + '/common'));
  this.app.use('/media', express.static(__dirname + '/media'));

  // Return index.html to browsers
  this.app.get('/', function(req, res) {
    console.log("loading index.html");
    res.sendfile('index.html');
  });

  // Create server application (express.js)
  this.serverapp = http.createServer(this.app);
  this.serverapp.listen(this.port, this.ipaddress);
  console.log("game server running @ http://" + this.ipaddress + ":" + this.port);

  // Create server objects
  this.messageBroker = new MessageBroker(this);
  this.messageHandler = new MessageHandler();
  this.gameAPI = new GameAPI();
  // Link the objects:
  // Incoming: MessageBroker -> MessageHandler -> GameAPI
  this.messageBroker.attachMessageHandler(this.messageHandler);
  this.messageHandler.attachGameAPI(this.gameAPI);
  // Outgoing: GameAPI -> MessageHandler -> MessageBroker
  this.gameAPI.attachMessageHandler(this.messageHandler);
  this.messageHandler.attachMessageBroker(this.messageBroker);

  console.log("game server started");
}

// Create the game server
var gameServer = new GameServer();