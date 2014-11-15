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
    this.game.updateMatch(msg);
    break;

    default:
    console.log("MessageHandler: default branch reached");
    break;
  }
},

MessageHandler.prototype.handleLoginResponse = function(msg) {
  if(msg.status == "OK" && msg.username) {
    this.setUsername(msg.username);
    document.getElementById('infotext').style.color = "black";
    document.getElementById('infotext').innerHTML = "Player <strong>" +
    msg.username + "</strong> logged in.";
    document.getElementById('infotext').innerHTML += '<br /><input id="logout_button" type="submit" value="Exit" onclick="logout();">';
  }
  else {
    var tmp = document.getElementById('infotext').innerHTML;
    //console.log(tmp);
    document.getElementById('infotext').style.color = "red";
    document.getElementById('infotext').innerHTML = "Login failed.";
    var t = setTimeout(function() { 
      document.getElementById('infotext').innerHTML = tmp; 
      document.getElementById('infotext').style.color = "black"; 
    }, 2000)
  }
},

MessageHandler.prototype.handleRegistrationResponse = function(msg) {
  if(msg.status == "OK" && msg.username) {
    this.setUsername(msg.username);
    document.getElementById('infotext').style.color = "black";
    document.getElementById('infotext').innerHTML = "New player <strong>" +
    msg.username + "</strong> registered.";
    document.getElementById('infotext').innerHTML += '&nbsp;&nbsp;<input id="logout_button" type="submit" value="Logout" onclick="logout();">';
  }
  else {
    var tmp = document.getElementById('infotext').innerHTML;
    document.getElementById('infotext').style.color = "red";
    document.getElementById('infotext').innerHTML = "Login failed.";
    var t = setTimeout(function() { 
      document.getElementById('infotext').innerHTML = tmp; 
      document.getElementById('infotext').style.color = "black"; 
    }, 2000)
  }
},

MessageHandler.prototype.handleChatMessage = function(msg) {
  console.log("handleChatMessage");

  if (msg.username == "System notice") {
    document.getElementById('messagebox').innerHTML += '<div id="message">' + msg.username + ':&nbsp;&nbsp;' + msg.text + '</div>';
  }
  else {
    document.getElementById('messagebox').innerHTML += '<div id="message"><a href="#" title="message">'+ msg.username + ':</a>&nbsp;&nbsp;' + msg.text + '</div>';
  }
  // Messagebox auto-scroll (quick 'n dirty hack, but should work :)
  document.getElementById('chatbox').scrollTop += 20;
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

  document.getElementById('onlineplayerlist').innerHTML = "";
  for(var player in this.playerList) {
    console.log("player:", player)
    var pre = '<div id="' + player +'">';
    var text = "";
    if (this.playerList[player].ingame == false && this.playerList[player].username != this.getUsername()) {
      text = ' <a href="#" title="challenge" onclick="challenge(\''+this.playerList[player].username+'\')">'+ this.playerList[player].username + '</a>';
    }
    else {
      text = player;
    }
    post = '</div>';
    document.getElementById('onlineplayerlist').innerHTML += pre + text + post;
  }

  this.sortDivs(document.getElementById('onlineplayerlist'));
},

MessageHandler.prototype.updateRankingList = function(msg) {

  var tmpusers = '<table id="rankings">';
  for(var item in msg.players) {
    tmpusers += '<tr>';
    tmpusers += '<td><strong>' + msg.players[item].username + '</strong></td><td>' + msg.players[item].highscore + '</td>';
    tmpusers += '</tr>';
  }
  tmpusers += '</table>'
  document.getElementById('rankedplayers').innerHTML = tmpusers;
  console.log("MessageHandler: Ranking list updated");
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

  var audio = document.getElementById('challenge_request_audio').play();

  console.log("handleChallengeRequest", msg);
  document.getElementById('challenge').innerHTML = 'You\'ve been challenged by<br /><strong>' + msg.challenger + '</strong><br />';
  document.getElementById('challenge').innerHTML += '<input type="button" value="Accept" onclick="acceptChallenge(\''+msg.challenger+'\')"><input type="button" value="Reject" onclick="rejectChallenge(\''+msg.challenger+'\')">';
  document.getElementById('challengebox').style.visibility="visible";
  this.challengeTmo = setTimeout("rejectChallenge(\'" + msg +"\')", 10000);
  //setInterval("this.challengeTimer("+msg+")", 1000);
},

MessageHandler.prototype.acceptChallenge = function(challenger) {
  clearTimeout(this.challengeTmo);
  console.log("handleChallengeRequest from", challenger);
  var resp = messages.message.CHALLENGE_RESP.new();

  resp.response = "OK";
  resp.challenger = challenger;
  resp.challengee = this.getUsername();
  this.send(resp);
  document.getElementById('challengebox').style.visibility="hidden";
},

MessageHandler.prototype.rejectChallenge = function(challenger) {
  clearTimeout(this.challengeTmo);
  console.log("handleChallengeRequest from", challenger);
  var resp = messages.message.CHALLENGE_RESP.new();
  resp.response = "NOK";
  resp.challenger = challenger;
  resp.challengee = this.getUsername();
  this.send(resp);
  document.getElementById('challengebox').style.visibility="hidden";
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
