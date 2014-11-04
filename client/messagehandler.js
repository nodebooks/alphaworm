var MessageHandler = function() {

  var self = this;
  self.messageBroker = undefined;
  self.game = undefined;
  self.username = undefined;
  self.playerList = {};

  self.init = function() {
    console.log("MessageHandler init");
    self.messageBroker = new MessageBroker(self);
    self.game = new Game(self);
  },

  self.attachBroker = function(messageBroker) {
    console.log("MessageHandler: messageBroker attached.")
    self.messageBroker = messageBroker;
  },

  self.send = function(msg) {
    self.messageBroker.send(msg);
  },

  self.receive = function(msg) {
    //console.log("MessageHandler.receive", msg);

    switch(msg.name) {
      case 'REGISTRATION_RESPONSE':
      console.log("MessageHandler: REGISTRATION_RESPONSE", msg.status);
      break;

      case 'LOGIN_RESPONSE':
      console.log("MessageHandler: LOGIN_RESPONSE", msg.status);
      self.handleLoginResponse(msg);
      break;

      case 'CHAT_MESSAGE':
      console.log("MessageHandler: CHAT_MESSAGE", msg);
      self.handleChatMessage(msg);
      break;

      case 'PLAYER_LIST':
      self.updatePlayerList(msg);
      break;

      case 'RANKING_LIST':
      self.updateRankingList(msg);
      break;

      case 'CHALLENGE_REQ':
      self.handleChallengeRequest(msg);
      break;

      case 'CHALLENGE_RESP':
      self.handleChallengeResponse(msg);
      break;

      case 'MATCH_SYNC':
      self.game.updateMatch(msg);
      break;

      default:
      console.log("MessageHandler: default branch reached");
      break;
    }
  },

  self.handleLoginResponse = function(msg) {
    if(msg.status == "OK" && msg.username) {
      self.setUsername(msg.username);
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

  self.handleRegistrationResponse = function(msg) {
    if(msg.status == "OK" && msg.username) {
      self.setUsername(msg.username);
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

  self.handleChatMessage = function(msg) {
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

  self.updatePlayerList = function(msg) {
    console.log("MessageHandler.updatePlayerList", msg);

    for(var item in msg.players) {
      console.log("item:", item);
      var player = msg.players[item];
      if(player.authenticated == false || player.authenticated == "false") {
        delete self.playerList[player.username];
      }
      else {
        self.playerList[player.username] = player;
      }
    }

    console.log("playerList:", self.playerList);

    document.getElementById('onlineplayerlist').innerHTML = "";
    for(var player in self.playerList) {
      console.log("player:", player)
      var pre = '<div id="' + player +'">';
      var text = "";
      if (self.playerList[player].ingame == false && self.playerList[player].username != self.getUsername()) {
        text = ' <a href="#" title="challenge" onclick="challenge(\''+self.playerList[player].username+'\')">'+ self.playerList[player].username + '</a>';
      }
      else {
        text = player;
      }
      post = '</div>';
      document.getElementById('onlineplayerlist').innerHTML += pre + text + post;
    }

    self.sortDivs(document.getElementById('onlineplayerlist'));
  },

  self.updateRankingList = function(msg) {

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

  self.sortDivs = function(container) {
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

  self.handleChallengeRequest = function(msg) {
    // Pop a dialog
    // TODO: support for multiple dialogs
    //document.getElementById('haasteajastin').innerHTML = "10";

    var audio = document.getElementById('challenge_request_audio');
    audio.volume = 0.6;
    audio.play();

    console.log("handleChallengeRequest", msg);
    document.getElementById('challenge').innerHTML = 'You\'ve been challenged by<br /><strong>' + msg.challenger + '</strong><br />';
    document.getElementById('challenge').innerHTML += '<input type="button" value="Accept" onclick="acceptChallenge(\''+msg.challenger+'\')"><input type="button" value="Reject" onclick="rejectChallenge(\''+msg.challenger+'\')">';
    document.getElementById('challengebox').style.visibility="visible";
    self.challengeTmo = setTimeout("rejectChallenge(\'" + msg +"\')", 10000);
    //setInterval("self.challengeTimer("+msg+")", 1000);
  },

  self.acceptChallenge = function(challenger) {
    clearTimeout(self.challengeTmo);
    console.log("handleChallengeRequest from", challenger);
    var resp = messages.message.CHALLENGE_RESP.new();

    resp.response = "OK";
    resp.challenger = challenger;
    resp.challengee = self.getUsername();
    self.send(resp);
    document.getElementById('challengebox').style.visibility="hidden";
  },

  self.rejectChallenge = function(challenger) {
    clearTimeout(self.challengeTmo);
    console.log("handleChallengeRequest from", challenger);
    var resp = messages.message.CHALLENGE_RESP.new();
    resp.response = "NOK";
    resp.challenger = challenger;
    resp.challengee = self.getUsername();
    self.send(resp);
    document.getElementById('challengebox').style.visibility="hidden";
  },

  self.challenge = function(username) {
    console.log("challenge", username);
    var msg = messages.message.CHALLENGE_REQ.new();
    msg.challenger = self.getUsername();
    msg.challengee = username;

    self.send(msg);
  },

  self.handleChallengeResponse = function(msg) {
    console.log("handleChallengeResponse():", msg);
  },

  self.setUsername = function(username) {
    self.username = username;
  },

  self.getUsername = function() {
    return self.username;
  }

  self.init();
}