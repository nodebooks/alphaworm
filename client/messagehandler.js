var MessageHandler = function() {

    var self = this;
    self.messageBroker = undefined;
    self.username = undefined;

    self.init = function() {
        console.log("MessageHandler started");
        self.messageBroker = new MessageBroker(self);
    },

    self.attachBroker = function(messageBroker) {
        console.log("MessageHandler: messageBroker attached.")
        self.messageBroker = messageBroker;
    },

    self.send = function(msg) {
        self.messageBroker.send(msg);
    },

    self.receive = function(msg) {
        switch(msg.name) {

            case 'REGISTRATION_RESPONSE':
                console.log("MessageHandler: REGISTRATION_RESPONSE", msg.status);
            break;

            case 'LOGIN_RESPONSE':
                console.log("MessageHandler: LOGIN_RESPONSE", msg.status);
                self.handleLoginResponse(msg);
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
            var t = setTimeout(function() { document.getElementById('infotext').innerHTML = tmp; document.getElementById('infotext').style.color = "black"; }, 2000)
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
            var t = setTimeout(function() { document.getElementById('infotext').innerHTML = tmp; document.getElementById('infotext').style.color = "black"; }, 2000)
        }
    },

    self.setUsername = function(username) {
        self.username = username;
    },

    self.getUsername = function() {
        return self.username;
    }

    self.init();
}