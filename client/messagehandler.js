function MessageHandler() {

  this.messageBroker = undefined;
  this.game = undefined;
  this.username = undefined;
  this.playerList = {};

  this.init();
}

MessageHandler.prototype.init = function() {
  console.log("MessageHandler init");
  this.messageBroker = new MessageBroker(this);
  this.game = new Game(this);

},

MessageHandler.prototype.attachBroker = function(messageBroker) {
  console.log("MessageHandler: messageBroker attached.")
  this.messageBroker = messageBroker;
},

MessageHandler.prototype.send = function(msg) {
  this.messageBroker.send(msg);
},

MessageHandler.prototype.receive = function(msg) {
  //console.log("MessageHandler.receive", msg);

  switch(msg.name) {
    case 'REGISTRATION_RESPONSE':
    console.log("MessageHandler: REGISTRATION_RESPONSE", msg.status);
    this.handleRegistrationResponse(msg);
    break;

    case 'LOGIN_RESPONSE':
    console.log("MessageHandler: LOGIN_RESPONSE", msg.status);
    this.handleLoginResponse(msg);
    break;

    case 'CHAT_MESSAGE':
    console.log("MessageHandler: CHAT_MESSAGE", msg);
    this.handleChatMessage(msg);
    break;

    case 'PLAYER_LIST':
    this.updatePlayerList(msg);
    break;

    case 'RANKING_LIST':
    this.updateRankingList(msg);
    break;

    case 'CHALLENGE_REQ':
    this.handleChallengeRequest(msg);
    break;

    case 'CHALLENGE_RESP':
    this.handleChallengeResponse(msg);
    break;

    case 'MATCH_SYNC':
    this.handleMatchSync(msg);
    break;

    default:
    console.log("MessageHandler: default branch reached");
    break;
  }
},

MessageHandler.prototype.handleLoginResponse = function(msg) {
  if(msg.status == "OK" && msg.username) {
    this.setUsername(msg.username);
    this.game.onLoginSuccess(msg.username);
  }
  else {
    this.game.onLoginFail();
  }
},

MessageHandler.prototype.handleRegistrationResponse = function(msg) {
  if(msg.status == "OK" && msg.username) {
    this.setUsername(msg.username);
    this.game.onRegistrationSuccess(msg.username)
  }
  else {
    this.game.onRegistrationFail();
  }
},

MessageHandler.prototype.handleChatMessage = function(msg) {
  console.log("handleChatMessage");
  this.game.onChatMessage(msg);
},

MessageHandler.prototype.updatePlayerList = function(msg) {
  console.log("MessageHandler.updatePlayerList", msg);

  for(var item in msg.players) {
    console.log("item:", item);
    var player = msg.players[item];
    if(player.authenticated == false || player.authenticated == "false") {
      delete this.playerList[player.username];
    }
    else {
      this.playerList[player.username] = player;
    }
  }
  console.log("playerList:", this.playerList);

  this.game.onPlayerListChange();
  
},

MessageHandler.prototype.updateRankingList = function(msg) {

  this.game.onRankingListChange(msg.players);
},

MessageHandler.prototype.sortDivs = function(container) {
  //console.log("sorting", container);
  var toSort = container.children;
  //console.log("toSort:", toSort);
  toSort = Array.prototype.slice.call(toSort, 0);

  toSort.sort(function(a, b) {
    var aSort = a.id.toLowerCase(),
    bSort = b.id.toLowerCase();
  //console.log(aSort, ":", bSort);
  if (aSort === bSort) return 0;
  return aSort > bSort ? 1 : -1;
  });

  var parent = container;
  parent.innerHTML = "";

  for(var i=0, l = toSort.length; i<l; i++) {
    parent.appendChild(toSort[i]);
  }
},

MessageHandler.prototype.handleChallengeRequest = function(msg) {
  // Pop a dialog
  // TODO: support for multiple dialogs
  //document.getElementById('haasteajastin').innerHTML = "10";
  
  this.game.onChallenge(msg);
  this.challengeTmo = setTimeout("rejectChallenge(\'" + msg +"\')", 10000);
  //setInterval("this.challengeTimer("+msg+")", 1000);
  
},

MessageHandler.prototype.acceptChallenge = function(challenger) {
  clearTimeout(this.challengeTmo);
  console.log("handleChallengeRequest from", challenger);
  var resp = messages.message.CHALLENGE_RESP.new();
  
  this.game.onAcceptChallenge(challenger);
  
  resp.response = "OK";
  resp.challenger = challenger;
  resp.challengee = this.getUsername();
  this.send(resp);

},

MessageHandler.prototype.rejectChallenge = function(challenger) {
  clearTimeout(this.challengeTmo);
  console.log("handleChallengeRequest from", challenger);

  this.game.onRejectChallenge(challenger)
  
  var resp = messages.message.CHALLENGE_RESP.new();
  resp.response = "NOK";
  resp.challenger = challenger;
  resp.challengee = this.getUsername();
  this.send(resp);

},

MessageHandler.prototype.challenge = function(username) {
  var msg = messages.message.CHALLENGE_REQ.new();
  msg.challenger = this.getUsername();
  msg.challengee = username;

  this.send(msg);
},

MessageHandler.prototype.handleChallengeResponse = function(msg) {
  console.log("handleChallengeResponse():", msg);
},

MessageHandler.prototype.setUsername = function(username) {
  this.username = username;
},

MessageHandler.prototype.getUsername = function() {
  return this.username;
}

MessageHandler.prototype.handleMatchSync = function(msg) {
  if (msg.phase == "INIT") {
    this.game.onGameStart(msg);
  }
  else if (msg.phase == "END") {
    self.game.onGameEnd(msg);
  }
  else {
    this.game.onGameUpdate(msg);
  }
}
