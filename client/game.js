function Game(messagehandler) {

  this.messageHandler = messagehandler;
  this.inGame = false;
  this.score = 0;
  this.music = null;
  this.preferredVolume = 0.3;
  this.maxVolume = 1.0;

  this.init();
}

Game.prototype.onRegistrationSuccess = function(username) {
  document.getElementById('infotext').style.color = "black";
  document.getElementById('infotext').innerHTML = "New player <strong>" +
    username + "</strong> registered.";
  document.getElementById('infotext').innerHTML += '&nbsp;&nbsp;<input id="logout_button" type="submit" value="Logout" onclick="logout();">';
},

Game.prototype.onRegistrationFail = function() {
  var tmp = document.getElementById('infotext').innerHTML;
  document.getElementById('infotext').style.color = "red";
  document.getElementById('infotext').innerHTML = "Registration failed.";
  var t = setTimeout(function() { 
    document.getElementById('infotext').innerHTML = tmp; 
    document.getElementById('infotext').style.color = "black"; 
  }, 2000)
}

Game.prototype.onLoginSuccess = function( username ){

  document.getElementById('infotext').style.color = "black";
  document.getElementById('login').style['visibility'] = 'hidden';
  document.getElementById('rankinglist').style['visibility'] = 'visible';
  document.getElementById('onlineplayers').style['visibility'] = 'visible';

},

Game.prototype.onLoginFail = function() {
  var tmp = document.getElementById('infotext').innerHTML;
  //console.log(tmp);
  document.getElementById('infotext').style.color = "red";
  document.getElementById('infotext').innerHTML = "Login failed.";
  var t = setTimeout(function() { 
    document.getElementById('infotext').innerHTML = tmp; 
    document.getElementById('infotext').style.color = "black"; 
  }, 2000)
},

Game.prototype.showChat = function() {

  var chat = document.getElementById('chat');
  chat.style.top = "0px";
 
}

Game.prototype.hideChat = function() {
  
  var chat = document.getElementById('chat');
  var height = chat.getBoundingClientRect().height;
  chat.style.top = -(height*0.85) +"px";

}

Game.prototype.onFoodCollect = function( food, collectType  ) {
  var cell = document.getElementById(food.location);
  cell.innerHTML = "";
},

Game.prototype.onWordComplete = function(message){

},

Game.prototype.displayEndStats = function( collected ) {

  var r = document.getElementById('logotext').getBoundingClientRect(); 
  var tmp = document.getElementById('gameover');
  tmp.style['top'] = r.bottom + "px";
  tmp.style['visibility'] = 'visible';

  window.setTimeout( function(){
    document.getElementById('gameover').style['visibility'] = 'hidden';
  },2500);
},

Game.prototype.onGameStart = function(msg) {
  this.initGame(msg);
  this.playMusic(this.preferredVolume);
  this.inGame = true;

  document.getElementById('onlineplayers').style['visibility'] = 'hidden';
  document.getElementById('rankinglist').style['visibility'] = 'hidden';
  document.getElementById('score').style['visibility'] = 'visible';
  document.getElementById('gameboard').style['visibility'] = 'visible';
},

Game.prototype.onGameEnd = function(msg) {
  this.inGame = false;
  this.stopMusic();

  document.getElementById('onlineplayers').style['visibility'] = 'visible';
  document.getElementById('rankinglist').style['visibility'] = 'visible';
  document.getElementById('score').style['visibility'] = 'hidden';
  document.getElementById('gameboard').style['visibility'] = 'hidden';

  this.displayEndStats(this.score);
},

Game.prototype.onPlayerListChange = function() {
  document.getElementById('onlineplayerlist').innerHTML = "";
  var list = this.messageHandler.playerList;
  for(var player in list) {
    console.log("player:", player)
    var pre = '<div id="' + player +'">';
    var text = "";
    if ( list[player].ingame == false && list[player].username != this.messageHandler.getUsername()) {
      text = ' <a href="#" title="challenge" onclick="challenge(\''+list[player].username+'\')">'+ list[player].username + '</a>';
    }
    else {
      document.getElementById('you').innerHTML = list[player].username;
    }
    post = '</div>';
    document.getElementById('onlineplayerlist').innerHTML += pre + text + post;
  }

  this.messageHandler.sortDivs(document.getElementById('onlineplayerlist'));
},

Game.prototype.onRankingListChange = function (playerList){
  var tmpusers = '<table id="rankings">';
  for(var item in playerList) {
    tmpusers += '<tr>';
    tmpusers += '<td><strong>' + playerList[item].username + '</strong></td><td>' + playerList[item].highscore + '</td>';
    tmpusers += '</tr>';
  }
  tmpusers += '</table>'
  document.getElementById('rankedplayers').innerHTML = tmpusers;
  console.log("MessageHandler: Ranking list updated");
},

Game.prototype.onChallenge = function(msg){
  var audio = document.getElementById('challenge_request_audio').play();
  
  console.log("handleChallengeRequest", msg);
  document.getElementById('challenge').innerHTML = 'You\'ve been challenged by<br /><strong>' + msg.challenger + '</strong><br />';
  document.getElementById('challenge').innerHTML += '<input type="button" value="Accept" onclick="acceptChallenge(\''+msg.challenger+'\')"><input type="button" value="Reject" onclick="rejectChallenge(\''+msg.challenger+'\')">';
  document.getElementById('challengebox').style.visibility="visible";
  
},

Game.prototype.onChatMessage = function(msg){
  if (msg.username == "System notice") {
    document.getElementById('messagebox').innerHTML += '<div id="message">' + msg.username + ':&nbsp;&nbsp;' + msg.text + '</div>';
  }
  else {
    document.getElementById('messagebox').innerHTML += '<div id="message"><a href="#" title="message">'+ msg.username + ':</a>&nbsp;&nbsp;' + msg.text + '</div>';
  }
  // Messagebox auto-scroll (quick 'n dirty hack, but should work :)
  document.getElementById('chatbox').scrollTop += 20;
},

Game.prototype.onAcceptChallenge = function(challenger){
  document.getElementById('challengebox').style.visibility="hidden";
},

Game.prototype.onRejectChallenge = function(challenger){
  document.getElementById('challengebox').style.visibility="hidden";
},

Game.prototype.init = function() {
  console.log("Called game.init()");
  this.initGame(null);
},

Game.prototype.initGame = function(msg) {
  console.log("initGame:", msg);

  if (null == msg) {
    console.log("create empty gameboard");
    this.gameArea = new GameArea();
  }
  else {
    this.worm = new Worm();
    this.gameArea = new GameArea();
    this.amountOfFood = 8;
    this.foods = [];
    this.food = new Food();
  }

  this.initGameboard();
  this.score = 0;

},

Game.prototype.playMusic = function(volume) {
  console.log("Game: playMusic");
  if (this.music == null) {
    console.log("Game: creating new audio instance");
    this.music = new Audio('../media/retro.ogg');
    if (typeof this.music.loop == 'boolean')
    {
      this.music.loop = true;
    }
    else
    {
      this.music.addEventListener('ended', function() {
        this.music.volume = this.preferredVolume;
        this.music.currentTime = 0;
        this.music.play();
      }, false);
    }
    this.music.volume = volume;
  }
  this.music.play();
},

Game.prototype.stopMusic = function() {
  console.log("Game: stopMusic");
  this.music.pause();
  this.music.duration = 0;
},

Game.prototype.initGameboard = function() {
  console.log("initGameboard");

  document.getElementById('gameboard').innerHTML = "";
  var gameboard = '<p id="score"></p>';
  // Create grid
  gameboard += '<table id="gamegrid">';
  for(var i=0; i<this.gameArea.height; i++) {
    gameboard += '<tr>'; // New row
    for(var j=0; j<this.gameArea.width; j++) {
      var id = (j+(i*this.gameArea.height));
      var grid = '<td id="' + id + '"></td>';
      gameboard += grid;
    }
    gameboard += '</tr>';
  }
  gameboard += '</table>';
  gameboard += "W = up, A = left, S = down, D = right";
  gameboard += "&nbsp;&nbsp;&nbsp;";


  document.getElementById('gameboard').innerHTML = gameboard;

  this.updateGameboard();
},

  Game.prototype.updateGameboard = function() {
  //console.log("updateGameboard");
  for(var i=0; i<this.gameArea.height; i++) {
    for(var j=0; j<this.gameArea.width; j++) {
      var id = (j+(i*this.gameArea.height));
      document.getElementById(id).bgColor = this.gameArea.color;
      document.getElementById(id).innerHTML = "";
    }
  }
},

Game.prototype.setFood = function() {
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

Game.prototype.removeFood = function(cell) {
  //console.log("Remove food", cell);
  for (var x=0; x<this.foods.length; x++) {
    if (this.foods[x] == cell) {
      this.foods.splice(x, 1);
    }
  }
  // Generate new food
  this.setFood();

},

Game.prototype.onGameUpdate = function(msg) {
  //console.log("update match");

  this.updateGameboard();

  // Render worms
  for (var id=0; id<msg.worms.length; id++) {
    for (var x=0; x<msg.worms[id].location.length; x++) {
      document.getElementById(msg.worms[id].location[x]).bgColor = msg.worms[id].color;
    }
  }
  
  // once there will be our copy of food, we can compare.
  if ( this.foods.length > 0 ){
    
    for (var x=0; x<msg.food.length; x++) {
      if ( this.foods[x].location != msg.food[x].location )
      {
        var w = 0;
        var collectType = 0;
        // determine did we collect it.
        for (; w<msg.worms.length; w++) {

          if (msg.worms[w].name == this.messageHandler.username ) {

            // set score 
            this.score = msg.worms[w].score;
            if ( this.prevScore < this.score ) collectType = 1;
            else if ( this.prevScore > this.score ) collectType = -1;
          
            // In case collect was ours
            if ( collectType != 0 ) {
              this.prevScore = this.score;
            } 
            break;
          } 
        }
        this.onFoodCollect( this.foods[x], collectType ); 
      }
    }
  }
  // duplicate food. 
  this.foods = JSON.parse(JSON.stringify(msg.food));

  // Render foods
  for (var x=0; x<msg.food.length; x++) {
    document.getElementById(msg.food[x].location).bgColor = msg.food[x].color;
    // Iteration 5 onwards - the alphabets
    document.getElementById(msg.food[x].location).innerHTML = msg.food[x].character.toUpperCase();
  }

  // Logic for detecting word completion
  if ( this.word == undefined ) { this.word = msg.word; }
  else if ( msg.word.from != this.word.from ) {

    this.onWordComplete(this.word.to.toUpperCase());
    this.word = msg.word;
    
  }

  // Print the word that needs a translation (the translation is there too, don't cheat! :)
  var from = msg.word['from'];
  var answer = msg.word['answer'];

  document.getElementById("score").innerHTML = "<strong>" + from.toUpperCase() + " = " + answer.toUpperCase() + "</strong><br />";
  for (var x=0; x<msg.worms.length; x++) {
    // A little trick to play audio when score is increased
    if (msg.worms[x].name == this.messageHandler.username && this.score < msg.worms[x].score) {
      //console.log("play ding")
      document.getElementById('pick_audio').play();
      this.score = msg.worms[x].score;
    }
    var separator = (x+1 != msg.worms.length) ? "&nbsp;&nbsp|&nbsp;&nbsp;" : "";
    document.getElementById("score").innerHTML += '<strong><font color="' + msg.worms[x].color + '">' + msg.worms[x].name +'</font></strong>';
    document.getElementById("score").innerHTML += ":&nbsp;" + msg.worms[x].score + separator;

  }

},

Game.prototype.startGame = function() {
  console.log("Game: startGame");
  var msg = messages.message.START_SINGLEPLAYER_GAME_REQ.new();
  msg.username = this.messageHandler.getUsername();
  this.messageHandler.send(msg);
},

Game.prototype.handleInput = function(event) {
  if(false == this.isRunning()) {
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
    msg.username = this.messageHandler.getUsername();
    this.messageHandler.send(msg);
  }

},



Game.prototype.isRunning = function() {
  return this.inGame;
}
