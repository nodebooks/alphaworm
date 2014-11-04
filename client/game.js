var Worm = function() { 
  this.name = "wormee";
  this.color = "blue";
  this.startingLength = 5;
  this.location = [];
  this.direction = "right";
  this.velocity = 1;
  this.score = 0;

  // init worm
  for(var x=0; x<this.startingLength; x++) {
    this.location[x] = x;
  }
}

var Food = function() {
  this.color = "white";
  this.growth = Math.floor(Math.random()*1+1); 
}

var GameArea = function() {

  this.height = 30;
  this.width = 30;

  this.color = "lightblue";
}

var Game = function (messagehandler) {
  var self = this;

  self.name = null;
  self.messageHandler = messagehandler;
  self.inGame = false;
  self.score = 0;
  self.music = null;
  self.preferredVolume = 0.1;
  self.maxVolume = 1.0;

  self.init = function() {
    console.log("Called game.init()");
    self.initGame(null);
  },

  self.initGame = function(msg) {
    console.log("initGame:", msg);

    if (null == msg) {
      console.log("create empty gameboard");
      self.gameArea = new GameArea();
    }
    else {
      self.worm = new Worm();
      self.gameArea = new GameArea();
      self.amountOfFood = 8;
      self.foods = [];
      self.food = new Food();
    }

    self.initGameboard();
    self.score = 0;

  },

  self.playMusic = function(volume) {
    console.log("Game: playMusic");
    if (self.music == null) {
      console.log("Game: creating new audio instance");
      self.music = new Audio('../media/retro.ogg');
      if (typeof self.music.loop == 'boolean')
      {
        self.music.loop = true;
      }
      else
      {
        self.music.addEventListener('ended', function() {
          self.music.volume = self.preferredVolume;
          self.music.currentTime = 0;
          self.music.play();
        }, false);
      }
      self.music.volume = volume;
    }
    self.music.play();
  },

  self.stopMusic = function() {
    console.log("Game: stopMusic");
    self.music.pause();
    delete self.music;
  }

  self.initGameboard = function() {
    console.log("initGameboard");

    document.getElementById('gameboard').innerHTML = "";
    var gameboard = '<p id="score"></p>';
    // Create grid
    gameboard += '<table id="gamegrid">';
    for(var i=0; i<self.gameArea.height; i++) {
      gameboard += '<tr>'; // New row
      for(var j=0; j<self.gameArea.width; j++) {
        var id = (j+(i*self.gameArea.height));
        var grid = '<td id="' + id + '"></td>';
        gameboard += grid;
      }
      gameboard += '</tr>';
    }
    gameboard += '</table>';
    gameboard += "W = up, A = left, S = down, D = right";
    gameboard += "&nbsp;&nbsp;&nbsp;";
    gameboard += '<input id="start_game" type="submit" value="StartGame" onclick="messageHandler.game.startGame()">';

    document.getElementById('gameboard').innerHTML = gameboard;

    self.updateGameboard();
  },

    self.updateGameboard = function() {
    //console.log("updateGameboard");
    for(var i=0; i<self.gameArea.height; i++) {
      for(var j=0; j<self.gameArea.width; j++) {
        var id = (j+(i*self.gameArea.height));
        document.getElementById(id).bgColor = self.gameArea.color;
        document.getElementById(id).innerHTML = "";
      }
    }
  },

  self.setFood = function() {
    // Check if any food is missing
    // Set foods to random positions
    while(this.foods.length < this.amountOfFood) {
        // A long worm may cause problems when an empty slot is selected
        // TODO: better algorithm for finding empty slot for food
        var x = Math.floor(Math.random()*this.gameArea.height*this.gameArea.width);
        if (document.getElementById(x).bgColor == this.gameArea.color) {
          this.foods.push(x);
          document.getElementById(x).bgColor = this.food.color;
        }
      }
    },

  self.removeFood = function(cell) {
    //console.log("Remove food", cell);
    for (var x=0; x<self.foods.length; x++) {
      if (self.foods[x] == cell) {
        self.foods.splice(x, 1);
      }
    }
    // Generate new food
    self.setFood();

  },

  self.updateMatch = function(msg) {
    //console.log("update match");

    self.updateGameboard();

    // Render worms
    for (var id=0; id<msg.worms.length; id++) {
      for (var x=0; x<msg.worms[id].location.length; x++) {
        document.getElementById(msg.worms[id].location[x]).bgColor = msg.worms[id].color;
      }
    }

    // Render foods
    for (var x=0; x<msg.food.length; x++) {
      document.getElementById(msg.food[x].location).bgColor = msg.food[x].color;
      // Iteration 5 onwards - the alphabets
      document.getElementById(msg.food[x].location).innerHTML = msg.food[x].character.toUpperCase();
    }

    // Print the word that needs a translation (the translation is there too, don't cheat! :)
    var from = msg.word['from'];
    var answer = msg.word['answer'];

    document.getElementById("score").innerHTML = "<strong>" + from.toUpperCase() + " = " + answer.toUpperCase() + "</strong><br />";
    for (var x=0; x<msg.worms.length; x++) {
      // A little trick to play audio when score is increased
      if (msg.worms[x].name == self.name && self.score < msg.worms[x].score) {
        var audio = document.getElementById('pick_audio');
        audio.volume = self.maxVolume;
        audio.play();
        audio.volume = self.preferredVolume;
        self.score = msg.worms[x].score;
      }
      var separator = (x+1 != msg.worms.length) ? "&nbsp;&nbsp|&nbsp;&nbsp;" : "";
      document.getElementById("score").innerHTML += '<strong><font color="' + msg.worms[x].color + '">' + msg.worms[x].name +'</font></strong>';
      document.getElementById("score").innerHTML += ":&nbsp;" + msg.worms[x].score + separator;

    }
    if (msg.phase == "INIT") {
      console.log("Match INIT");
      self.initGame(msg);
      self.playMusic(self.preferredVolume);
      self.inGame = true;
    }
    if (msg.phase == "END") {
      console.log("Match END");
      self.stopMusic();
      self.endGame();
    }
  },

  self.startGame = function() {
    console.log("Game: startGame");
    var msg = messages.message.START_SINGLEPLAYER_GAME_REQ.new();
    msg.username = self.messageHandler.getUsername();
    self.messageHandler.send(msg);
  },

  self.handleInput = function(event) {
    if(false == self.isRunning()) {
      console.log("handleInput: not in game");
      return false;
    }

    var direction = null;
    var input = event.which | event.keyCode | event.charCode;
    switch (input) {
      case 65:
      case 97:
      case 37:
      //console.log("A");
      direction = 'left';
      break;

      case 68:
      case 100:
      case 39:
      //console.log("D");
      direction = 'right';
      break;

      case 83:
      case 115:
      case 40:
      //console.log("S");
      direction = 'down';
      break;

      case 87:
      case 119:
      case 38:
      //console.log("W");
      direction = 'up';
      break;

      default:
      console.log(input);
      break;
    }

    //console.log("Game.handleInput", direction);
    
    if (direction != null) {
      var msg = messages.message.USER_INPUT.new();
      msg.direction = direction;
      msg.username = self.messageHandler.getUsername();
      self.messageHandler.send(msg);
    }

  },

  self.endGame = function() {
    self.inGame = false;
    self.stopMusic();
  },

  self.isRunning = function() {
    return self.inGame;
  }

  self.init();
}