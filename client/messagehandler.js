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
  switch(msg.name) {
    case 'REGISTRATION_RESPONSE':
    console.log("MessageHandler: REGISTRATION_RESPONSE", msg.status);
    break;

    case 'LOGIN_RESPONSE':
    console.log("MessageHandler: LOGIN_RESPONSE", msg.status);
    this.handleLoginResponse(msg);
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
    var t = setTimeout(function() { document.getElementById('infotext').innerHTML = tmp; document.getElementById('infotext').style.color = "black"; }, 2000)
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
    var t = setTimeout(function() { document.getElementById('infotext').innerHTML = tmp; document.getElementById('infotext').style.color = "black"; }, 2000)
  }
},

MessageHandler.prototype.setUsername = function(username) {
  this.username = username;
},

MessageHandler.prototype.getUsername = function() {
  return this.username;
}