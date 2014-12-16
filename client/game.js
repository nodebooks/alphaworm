var HideEffect = function(target){
  
  var t = new TWEEN.Tween( { s: 1.0, obj: target})
    .to ( { s: 0.0 }, 550)
    .easing( TWEEN.Easing.Elastic.InOut)
    .onStart( function(){
      
      document.getElementById(this.obj).style["-webkit-transform"] = "scale(1)";
      document.getElementById(this.obj).style["transform"] = "scale(1)";
      document.getElementById(this.obj).style["-o-transform"] = "scale(1)";
      document.getElementById(this.obj).style["-ms-transform"] = "scale(1)";
    })
    .onUpdate( function(){
      
      document.getElementById(this.obj).style["-webkit-transform"] = "scale("+this.s+")";
      document.getElementById(this.obj).style["transform"] = "scale("+this.s+")";
      document.getElementById(this.obj).style["-o-transform"] = "scale("+this.s+")";
      document.getElementById(this.obj).style["-ms-transform"] = "scale("+this.s+")";
      
    }).onComplete(function(){
      
      document.getElementById(this.obj).style.visibility = 'hidden';
      
    });
  return t;
}

var ShowEffect = function(target){
  
  var t = new TWEEN.Tween( { s: 0.10, obj: target})
    .to ( { s: 1.0 }, 550)
    .easing( TWEEN.Easing.Elastic.InOut)
    .onStart( function(){
      
      document.getElementById(this.obj).style["-webkit-transform"] = "scale(0)";
      document.getElementById(this.obj).style["transform"] = "scale(0)";
      document.getElementById(this.obj).style["-o-transform"] = "scale(0)";
      document.getElementById(this.obj).style["-ms-transform"] = "scale(0)";
      document.getElementById(this.obj).style.visibility = 'visible';
    })
    .onUpdate( function(){
      
      document.getElementById(this.obj).style["-webkit-transform"] = "scale("+this.s+")";
      document.getElementById(this.obj).style["transform"] = "scale("+this.s+")";
      document.getElementById(this.obj).style["-o-transform"] = "scale("+this.s+")";
      document.getElementById(this.obj).style["-ms-transform"] = "scale("+this.s+")";
      
    });
  return t;
}

var SlideFromRight = function(which) {
    var tween = new TWEEN.Tween( { y: -500 })
	.to ( { y: 0 }, 500)
	.easing( TWEEN.Easing.Exponential.Out )
	.onStart( function(){
	    document.getElementById(which).style.visibility = 'visible';
	    document.getElementById(which).style["-webkit-transform"] = "scale(1)";
	    document.getElementById(which).style["transform"] = "scale(1)";
	    document.getElementById(which).style["-o-transform"] = "scale(1)";
	    document.getElementById(which).style["-ms-transform"] = "scale(1)";
	})
	.onUpdate( function(){
	    document.getElementById(which).style.right = this.y +"px";
	});
    return tween;
}

var SlideFromLeft = function(which) {
    var tween = new TWEEN.Tween( { y: -500 })
	.to ( { y: 0 }, 500)
	.easing( TWEEN.Easing.Exponential.Out )
	.onStart( function(){
	    document.getElementById(which).style.visibility = 'visible';
	    document.getElementById(which).style["-webkit-transform"] = "scale(1)";
	    document.getElementById(which).style["transform"] = "scale(1)";
	    document.getElementById(which).style["-o-transform"] = "scale(1)";
	    document.getElementById(which).style["-ms-transform"] = "scale(1)";
	})
	.onUpdate( function(){
	    document.getElementById(which).style.left = this.y +"px";
	});
    return tween;
}


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

 var hideTween = HideEffect('login');
  
  document.getElementById('logotext').innerHTML = '<h1>Hello '+username+'!</h1>';
  // initialize appear effects 
  var showRanking = SlideFromLeft('onlineplayers');
  var showPlayers = SlideFromRight('rankinglist');
  
  // set fancy timing sequence for elements to appear
  hideTween.onComplete( function(){
    showRanking.start();
    window.setTimeout( function(){
      showPlayers.start();
    },250);
  });
  // start animation
  hideTween.start();
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
    console.log('onfoodCollect', food, collectType);
  if ( collectType == 0 ) { 
    // collect, but not from us
    document.getElementById(food.location).innerHTML = "";

  } else {

    // when we collected
    var cell = document.getElementById(food.location);
    var rect = cell.getBoundingClientRect();
    var effectDiv = document.createElement("div");
    effectDiv.appendChild(document.createTextNode(food.character.toUpperCase()));
    effectDiv.style["position"]= "absolute";
    effectDiv.style["z-index"]= "3";
    effectDiv.style["top"] = rect.top + "px";
    effectDiv.style["left"] = rect.left + "px";
    document.body.appendChild(effectDiv);
    // clear character after collect
    cell.innerHTML = "";        

    var tween = new TWEEN.Tween( { s: 1 } )
      .to( { s: 12 }, 1000 )
      .easing( TWEEN.Easing.Back.Out )
      .onUpdate( function () {
       var tmp = effectDiv;
       tmp.style.transform = "scale("+this.s+")";
       tmp.style["-webkit-transform"] = "scale("+this.s+")";
       tmp.style["-o-transform"] = "scale("+this.s+")";
       tmp.style["-ms-transform"] = "scale("+this.s+")";
       
      });
    
    var tweenFade = new TWEEN.Tween( { o: 1.0 } )
      .to( { o: 0.0 }, 500 )
      .easing( TWEEN.Easing.Exponential.Out )
      .onUpdate( function () {
	var tmp = effectDiv;
	tmp.style.opacity = this.o;
	
      })
      .onComplete( function(){
	var tmp = effectDiv;
	document.body.removeChild(tmp);
      }); 
    tween.chain(tweenFade);
    tween.start();
    
  }
},

Game.prototype.onWordComplete = function(message){

  var r = document.getElementById("logotext").getBoundingClientRect();  
  /* Hide logo text, get its position on screen. */
  document.getElementById("logotext").style["visibility"] = 'hidden';

  
  // position completed-text where logo text was with proper word
  var tmp = document.getElementById("completed");

  tmp.innerHTML = '<h1>'+message+'</h1>';
  tmp.style.opacity = 1.0;
  tmp.style['top'] = r.top+'px';
  tmp.style['left'] = r.left+'px';
  tmp.style['width'] = r.width+'px';
  tmp.style['height'] = r.height+'px';
  
  tmp.style.visibility = 'visible';
  tmp.style.transform = 'scaleX(1)';
  tmp.style["-webkit-transform"] = 'scaleX(1)';
  tmp.style["-o-transform"] = 'scaleX(1)';
  tmp.style["-ms-transform"] = 'scaleX(1)';
  

  var scaleAndHide = new TWEEN.Tween( { o: 1.0, x: 1.0, y:2.0 } )
  
    .to( { o: 0.0, x:12, y:0.0 }, 2000 )
    .easing( TWEEN.Easing.Bounce.Out  )
    .onUpdate( function () {

      // change opacity
      tmp.style.opacity = this.o;
      // define non-uniform scale transformation 
      tmp.style.transform = 'scale('+this.x+','+this.y+')';
      tmp.style["-webkit-transform"] = 'scale('+this.x+','+this.y+')';
      tmp.style["-o-transform"] = 'scale('+this.x+','+this.y+')';
      tmp.style["-ms-transform"] = 'scale('+this.x+','+this.y+')';

    })
    .onComplete( function(){
      document.getElementById("completed").style['visibility'] = 'hidden';
      document.getElementById("logotext").style["visibility"] = 'visible';
    });
  scaleAndHide.start();

},
// Tells us which part of of worm sprite gets drawn to which tile.
// This is one lengthy bugger.
Game.prototype.getWormTileByPosition = function ( positions, i ) {
  var worm = {
    tail : {
      up : { rect: 'rect(41px,80px,60px,61px)', top:'-40px', left: '-60px' },
      down: { rect: 'rect(41px,60px,60px,41px)', top:'-40px', left: '-40px' },
      right: { rect: 'rect(61px,60px,80px,41px)', top:'-60px', left: '-40px' },
      left:  { rect: 'rect(61px,80px,80px,61px)', top:'-60px', left: '-60px' }
    },
    head : {
      down : {rect: 'rect(61px,40px,80px,21px)', top:'-60px', left:'-20px' },
      up: { rect: 'rect(61px,20px,80px,1px)', top: '-60px', left: '0px' },
      right: { rect: 'rect(41px, 20px,60px,1px )', top: '-40px', left: '0px' },
      left: { rect: 'rect(41px, 40px , 60px, 21px )', top:'-40px', left: '-20px' }
    },
    body : {
      horizontal: { rect: 'rect(1px,20px,20px,1px)', top:'0px', left:'0px' },
      vertical: { rect: 'rect(1px,40px,20px,21px)', top:'0px', left:'-20px' },
      up_right: { rect: 'rect(21px,80px,40px,61px)', top:'-20px', left:'-60px'},
      up_left: { rect: 'rect(21px,60px,40px,41px)', top:'-20px', left:'-40px' },
      down_right: { rect: 'rect(21px,20px,40px,1px)', top:'-20px', left:'0px' },
      down_left: { rect: 'rect(21px,40px,40px,21px)', top:'-20px', left:'-20px' }
    }
  }
  if ( this.gameArea === undefined) return worm.body.horizontal;
  
  // Locations are expected to be ordered from tail to head.
  var current = { x:0,y:0 }
  var next = { x:0,y:0 }
  var prev = { x:0, y:0 }
  
  current.y = Math.floor(positions[i] / this.gameArea.width); 
  current.x = positions[i] % this.gameArea.width;

  if ( i == 0 ){ // tail
    // next body part
    next.y = Math.floor(positions[i+1] / this.gameArea.width); 
    next.x = positions[i+1] % this.gameArea.width;
    
    if ( next.x == current.x ) 
    {
      if ( current.y < next.y )
      {
	if ( next.y - current.y > 1 ) return worm.tail.up;
	else                     return worm.tail.down;
      }
      else 
      {
	if ( current.y - next.y > 1 ) return worm.tail.down;
	else                     return worm.tail.up;
      }
    }
    else if ( next.y == current.y ) 
    { 
      if ( current.x < next.x ) 
      {
	if (next.x - current.x > 1) return worm.tail.left;
	else                   return worm.tail.right;
      }
      else
      {
	if ( current.x - next.x > 1 ) return worm.tail.right;
	else                     return worm.tail.left;
      }
    }
  } 
  else if ( i == positions.length-1) // head
  {
    // compute previous
    prev.y = Math.floor(positions[i-1] / this.gameArea.width); 
    prev.x = positions[i-1] % this.gameArea.width;
    if ( prev.x == current.x ) 
    {
      if ( prev.y < current.y ) 
      {
	if (  current.y - prev.y > 1 ) return worm.head.up;
	else                       return worm.head.down;
      }
      else
      {
	if (  prev.y - current.y > 1 ) return worm.head.down;
	else                       return worm.head.up;
      }
    }
    else if ( prev.y == current.y ) 
    {
      if ( prev.x < current.x ) 
      {
	if ( current.x - prev.x > 1 ) return worm.head.left;
	else                      return worm.head.right;
      }
      else
      {
	if ( prev.x - current.x > 1 ) return worm.head.right;
	else                     return worm.head.left;
      }
    }
  }
  else  // regular body
  {
    // compute previous and next part 
    prev.y = Math.floor(positions[i-1] / this.gameArea.width); 
    prev.x = positions[i-1] % this.gameArea.width;
    next.y = Math.floor(positions[i+1] / this.gameArea.width); 
    next.x = positions[i+1] % this.gameArea.width;
    
    // go straight       A
    //                   |
    //                   v
    if ( prev.y == next.y ) return worm.body.vertical;
    
    // go straight
    //
    // <--->
    if ( prev.x == next.x ) return worm.body.horizontal;

    // --->  Going right or left with border crossing
    if ( prev.x < current.x  ) {
      
      // Going left...
      if ( current.x - prev.x > 1 ) 
      {
	// next tile is below current one
	if ( current.y < next.y)  
	{
	  // Went across border while turning (so we went up)
	  if ( next.y - current.y > 1 ) return worm.body.up_right;
	  // Went down
	  else                          return worm.body.down_right;
	}
	// next tile is above current one
	if ( current.y > next.y) 
	{
	  // Went across border while turning ( so we went down)
	  if ( current.y - next.y > 1 ) return worm.body.down_right;
	  // went up
	  else                          return worm.body.up_right;
	}
      }
      else  // going right...
      {
	
	// next tile is below current one
	if ( current.y < next.y) 
	{
	  // Went across a border while turning (so we went up)
	  if ( next.y - current.y > 1 ) return worm.body.up_left;
	  // went down
	  else                    return worm.body.down_left;
	}
	// next file is above current one
	if ( current.y > next.y) 
	{
	  // Went across a border while turning (so we went down)
	  if ( current.y - next.y > 1 ) return worm.body.down_left;
	  // went up
	  else                    return worm.body.up_left;
	}
      }
    }
    // <--- Going left (or right with border crossing)
    else if ( prev.x > current.x  ) 
    {
      
      if ( prev.x - current.x > 1 )
      {
	if ( current.y < next.y) 
	{
	  if ( next.y - current.y > 1 ) return worm.body.up_left;
	  else                        return worm.body.down_left;
	}
	if ( current.y > next.y) 
	{
	  if ( current.y - next.y > 1 ) return worm.body.down_left;
	  else                        return worm.body.up_left;
	}
      }
      else 
      {
	if ( current.y < next.y) 
	{
	  if ( next.y - current.y > 1 ) return worm.body.up_right;
	  else                        return worm.body.down_right;
	}
	
	if ( current.y > next.y) 
	{
	  if ( current.y - next.y > 1 ) return worm.body.down_right;
	  else                    return worm.body.up_right;
	}
      }
    }
    //   V going down (or up with border crossing)
    else if ( prev.y < current.y ) {
      if ( current.y - prev.y > 1 )
      {
	if ( current.x < next.x) 
	{
	  if ( next.x - current.x > 1 ) return worm.body.down_left;
	  else                    return worm.body.down_right;
	}

	if ( current.x > next.x) 
	{
	  if ( current.x - next.x > 1 ) return worm.body.down_right;
	  else                    return worm.body.down_left;
	}
      }
      else
      {
          
	if ( current.x < next.x) 
	{
	  if ( next.x - current.x > 1 ) return worm.body.up_left;
	  else                    return worm.body.up_right;
	}

	if ( current.x > next.x) 
	{
	  if ( current.x - next.x > 1 ) return worm.body.up_right;
	  else                    return worm.body.up_left;
	}
      }
    } 
    //   A
    //   | going up (or down with border crossing.)
    else if ( prev.y > current.y ) {
      if ( prev.y - current.y > 1 )
      {
	if ( current.x < next.x) 
	{
	  if ( next.x - current.x > 1 ) return worm.body.up_left;
	  else                        return worm.body.up_right;
	}
	// turning left
	// <-+
	//   |
	if ( current.x > next.x) 
	{
	  if ( current.x - next.x > 1  ) return worm.body.up_right;
	  else                         return worm.body.up_left;
	}
      }
      else {
	// turning right
	//   +-->
	//   | 
	if ( current.x < next.x) 
	{
	  if ( next.x - current.x > 1 ) return worm.body.down_left;
	  else                        return worm.body.down_right;
	}
	// turning left
	// <-+
	//   |
	if ( current.x > next.x) 
	{
	  if ( current.x - next.x > 1  ) return worm.body.down_right;
	  else                         return worm.body.down_left;
	}
      }
    }
  }
  // default, should not be here. Give error message and return something arbitrary.
  console.log("ERROR: should not reach here! getWormTileByPosition");
  return worm.body.horizontal;
}

Game.prototype.killBoardEffect = function() {

  var self = this;
  var board = document.getElementById("gameboard");
  
  var rumble = new TWEEN.Tween( { s: 20.0 } )
    .to( { s:0.0 }, 1750 )
    .easing( TWEEN.Easing.Bounce.InOut )
    .onUpdate( function () {
      var tmp = document.getElementById("gameboard");
      tmp.style["top"] = this.s*Math.random() + "px";
      tmp.style["left"] = this.s*Math.random() +"px";
    });

  var drop = new TWEEN.Tween( { y: 0.0 } )
    .to( { y : window.innerHeight}, 750)
    .easing( TWEEN.Easing.Exponential.In )
    .onUpdate( function(){
      var tmp = document.getElementById("gameboard");
      tmp.style["top"] = this.y+"px";
    });

  var nothing = new TWEEN.Tween( { s:0.0} )
    .to({ s:1.0}, 1000)
    .easing( TWEEN.Easing.Bounce.InOut)
    .onStart( function(){

      console.log('here');
      //kill gamegrid.
      var grid = document.getElementById("gamegrid");
      grid.parentNode.removeChild(grid);
      document.getElementById("gameboard").style["top"] = "0px";
      self.displayEndStats( self.score);
    })
    .onUpdate( function(){})

  rumble.chain(drop);
  drop.chain(nothing);
  rumble.start();
},

Game.prototype.displayEndStats = function( collected ) {

  // Show "menu" again with same animation as before

  var hideStats = HideEffect('score');
  hideStats.start();

  document.getElementById('gameboard').style['visibility'] = 'hidden';      

  hideStats.onComplete(function(){
    
    var r = document.getElementById('logotext').getBoundingClientRect(); 
    var tmp = document.getElementById('gameover');
    tmp.style['top'] = r.bottom + "px";
    tmp.style['visibility'] = 'visible';
    
    window.setTimeout( function(){
      document.getElementById('gameover').style['visibility'] = 'hidden';

      var showRanking = SlideFromRight('rankinglist');
      var showPlayers = SlideFromLeft('onlineplayers');
      document.getElementById("logotext").innerHTML = "<h1>A Planetscale Hunger For Words.</h1>";
      
      showRanking.start();
      window.setTimeout( function(){
	showPlayers.start();
      },250);
    },2500);
  });
},

Game.prototype.onGameStart = function(msg) {

  var self = this;
  var hidePlayers = HideEffect('onlineplayers');
  var hideRanking = HideEffect('rankinglist');

  hideRanking.onComplete(function(){

    self.initGame(msg);
    self.playMusic(self.preferredVolume);
    self.inGame = true;

    self.playMusic(self.preferredVolume);
    var showStats = SlideFromRight('score');
    showStats.start();
    document.getElementById('gameboard').style['visibility'] = 'visible';

  });

  hidePlayers.start();
  window.setTimeout(function(){
    hideRanking.start();
  },250);

}

Game.prototype.onGameEnd = function(msg) {
  this.inGame = false;
  this.stopMusic();
  this.updateGameboard();
  this.killBoardEffect();
  //this.displayEndStats(this.score);
},

Game.prototype.onPlayerListChange = function() {

  document.getElementById('onlineplayerlist').innerHTML = "";
  var list = this.messageHandler.playerList;
  for(var player in list ) {
    console.log("player:", player)
    var pre = '<div id="' + player +'">';
    var text = "";
    if (list[player].ingame == false && list[player].username != this.messageHandler.getUsername()) {
      text  = '<div class="onlineplayer" id="'+player+'_challenge_buttons">';
      text += list[player].username
      text += '<button class="button ui-space-blue" onclick="challenge(\''+list[player].username+'\');">Challenge</button>';
      text += '</div>';
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
  document.getElementById('challenge').innerHTML = 'You\'ve been challenged by<br /><h1>' + msg.challenger + '</h1><br />';
  document.getElementById('challenge').innerHTML += '<input type="button" class="button ui-space-blue" value="Accept" onclick="acceptChallenge(\''+msg.challenger+'\')"><input type="button" class="button ui-space-blue" value="Reject" onclick="rejectChallenge(\''+msg.challenger+'\')">';
  document.getElementById('challengebox').style.visibility="visible";
  var slideIn = SlideFromLeft('challengebox');
  slideIn.start();
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
  var hide = HideEffect('challengebox');
  hide.start();
},

Game.prototype.onRejectChallenge = function(challenger){
  var hide = HideEffect('challengebox');
  hide.start();
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
    this.food = new Food();
  }
  // load worm images
  var color = ["blue", "green", "orange", "brown", "red", "black"];
  for( var c=0;c<color.length;c++){
    new Image().src = './media/spaceworm_'+color[c]+'.png';
  }

  this.word = undefined;
  this.initGameboard();
  this.score = 0;
  this.prevScore = 0;
  // for detecting letter collisions properly.
  this.foods = [];

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

  var gameboard = '';
  var food = '';
  var worms = '';
  var grid = '';

  // Create grid
  gameboard+='<div id="gamegrid">';
  food += '<div id="food">';
  worms += '<div id="worms">';
  grid += '<div id="background-grid">';

  for(var i=0; i<this.gameArea.height; i++) {
    food += '<div class="row">'; // New row
    worms += '<div class="row">'; // New row
    grid += '<div class="row">'; // New row

    for(var j=0; j<this.gameArea.width; j++) {
      var id = (j+(i*this.gameArea.height));

      food += '<div class="food" id="' + id + '"></div>';
      worms += '<div class="worm"><img class="wormimage" id="' + id + '_worm" src="./media/worm.png"></div>';
      grid += '<div class="grid" id="' + id + '_bg"></div>';

    }
    food += '</div>';
    worms += '</div>';
    grid += '</div>';

  }
  /*background */
  gameboard += grid;
  gameboard += '</div>';// close background grid div

  // characters
  gameboard += food;
  gameboard += '</div>'; // close food div

  // worm 
  gameboard += worms;
  gameboard += '</div>';// close worms div

  gameboard += '</div>';// close gamegrid div

  document.getElementById('gameboard').innerHTML = gameboard;
  this.updateGameboard();
},

Game.prototype.updateGameboard = function() {
  //console.log("updateGameboard");
  for(var i=0; i<this.gameArea.height; i++) {
    for(var j=0; j<this.gameArea.width; j++) {
      var id = (j+(i*this.gameArea.height));
      document.getElementById(id+'_worm').style["visibility"] = "hidden";
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

  this.updateGameboard();

  // Render worms
  for (var id=0; id<msg.worms.length; id++) {
    for (var x=0; x<msg.worms[id].location.length; x++) {

      var cell = document.getElementById(msg.worms[id].location[x]+'_worm'); 
      var clipping = this.getWormTileByPosition(msg.worms[id].location, x);
      
      cell.style["visibility"] = "visible";
      cell.style["clip"] = clipping.rect;
      cell.style["top"] = clipping.top;
      cell.style["left"] = clipping.left;

      cell.src = './media/spaceworm_'+msg.worms[id].color+'.png';
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

  document.getElementById("logotext").innerHTML = "<h1>" + 
     from.toUpperCase() + " = " + answer.toUpperCase() + "</h1><br />";

  document.getElementById('score').innerHTML = ""
  
  for (var x=0; x<msg.worms.length; x++) {

    var line = '<div>';

    line += '<div class="worm"><img class="wormtail" src="./media/spaceworm_'+msg.worms[x].color+'.png"></div>';
    line += '<div class="worm"><img class="wormbody" src="./media/spaceworm_'+msg.worms[x].color+'.png"></div>';
    line += '<div class="worm"><img class="wormhead" src="./media/spaceworm_'+msg.worms[x].color+'.png"></div>';

    line += '&nbsp;<span class="scoretext">'+msg.worms[x].name + ' ' + msg.worms[x].score + '</span></div>';

    document.getElementById('score').innerHTML += line;
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

// for tweening library to work.
animate();
function animate() {
    requestAnimationFrame( animate ); 
    TWEEN.update();
}
