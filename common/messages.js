// Same code shall function in server and client, thus the declaration below
(function(exports){

  message = {
    id: "1",

    REGISTRATION_REQUEST: {
      message: {
        name: "REGISTRATION_REQUEST",
        username: null,
        passwordhash: null 
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    REGISTRATION_RESPONSE: {
      message: {
        name: "REGISTRATION_RESPONSE", 
        status: null    // OK / NOK 
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    LOGIN_REQUEST: {
      message: {
        name: "LOGIN_REQUEST",
        username: null, 
        passwordhash: null
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    LOGIN_RESPONSE: {
      message: {
        name: "LOGIN_RESPONSE",
        username: null,
        status: null	// OK / NOK
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    CHAT_MESSAGE: {
      message: {
        name: "CHAT_MESSAGE",
        username: null,  // message sender
        text: null       // message content
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    PLAYER_LIST: {
      message: {
        name: "PLAYER_LIST",
        type: "full/update",                // Always check whether this is an update or a full list
        players: [{username: null,
        authenticated: false,
        ingame: false}]           // false if user is not in game, othwerwise true
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    RANKING_LIST: {
      message: {
        name: "RANKING_LIST",
        players: [{username: "Wobotti", // Players are already in descending order (highest rank -> lowest, check SQL SELECT)
        highscore: null}]
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    CHALLENGE_REQ: {
      message: {
        name: "CHALLENGE_REQ",
        challenger: "username",
        challengee: "username"
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    CHALLENGE_RESP: {
      message: {
        name: "CHALLENGE_RESP",
        challenger: "username",
        challengee: "username",
        response: "OK/NOK"
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    MATCH_SYNC: {
      message: {
        name: "MATCH_SYNC",
        phase: "INIT/RUN/END",
        msgid: null,
        gamearea: [],   // gameArea object
        worms: [],
        foods: [],
        word: {},    //{finnish: null, english: null}
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    USER_INPUT: {
      message: {
        name: "USER_INPUT",
        username: "username",
        direction: "left/right/up/down"
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    START_SINGLEPLAYER_GAME_REQ: {
      message: {
        name: "START_SINGLEPLAYER_GAME_REQ",
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },

    START_SINGLEPLAYER_GAME_RESP: {
      message: {
        name: "START_SINGLEPLAYER_GAME_RESP",
        response: "OK/NOK"
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    },
    
    START_MULTIPLAYER_GAME_REQ: {
      message: {
        name: "START_MULTIPLAYER_GAME_REQ",
        username: "username",
        type: "single/multi",   // single = single player, multi=multiplayer
        players: [{}] // Usernames and their responses {username: "username", response: "OK/NOK"}
      },
      new: function() {
        return JSON.parse(JSON.stringify(this.message));
      }
    }
  };

  exports.message = message;

})(typeof exports === 'undefined'? this['messages']={}: exports);
