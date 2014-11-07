function MessageHandler() {

  this.messageBroker = undefined;
  this.username = undefined;

  this.init();
}

MessageHandler.prototype.init = function() {
  console.log("MessageHandler started");
  this.messageBroker = new MessageBroker(this);
},

MessageHandler.prototype.attachBroker = function(messageBroker) {
  console.log("MessageHandler: messageBroker attached.")
  this.messageBroker = messageBroker;
},

MessageHandler.prototype.send = function(msg) {
  this.messageBroker.send(msg);
},

MessageHandler.prototype.receive = function(msg) {
  console.log("MessageHandler.receive", msg);

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
    console.log("MessageHanderl: update ranking list", msg);
    this.updateRankingList(msg);
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
  switch(msg.type) {
    case 'update':
    console.log("preparing partial update on", document.getElementById('onlineplayerlist').innerHTML);
    for (var item in msg.players) {
      console.log("partial update", item, ":", msg.players[item]);

      if (msg.players[item].authenticated == true || msg.players[item].authenticated == "true") {
        var pre = '<div id="' + msg.players[item].username +'">';
        var player = msg.players[item].username;
        post = '</div>';

        document.getElementById('onlineplayerlist').innerHTML += pre + player + post;
        console.log("update ready", document.getElementById('onlineplayerlist').innerHTML);
      }
      else {
        console.log("removing", item, ":", document.getElementById(msg.players[item].username));
        var rem = document.getElementById(msg.players[item].username);
        rem.remove();
      }
    }
    break;

    case 'full':
    console.log("full update");
    document.getElementById('onlineplayerlist').innerHTML = "";
    for(var item in msg.players) {
      var pre = '<div id="' + msg.players[item].username +'">';
      var player = msg.players[item].username;
      post = '</div>';
      document.getElementById('onlineplayerlist').innerHTML += pre + player + post;
    }
    break;

    default:
    console.log("MessageHandler.updatePlayerList: default branch reached");
    break;
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

MessageHandler.prototype.setUsername = function(username) {
  this.username = username;
},

MessageHandler.prototype.getUsername = function() {
  return this.username;
}
