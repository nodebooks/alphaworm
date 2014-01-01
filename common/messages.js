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
                status: null    // OK / NOK (could be, 1/0, true/false, success/failure, etc.)
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
                          authenticated: null}]     // false if user disconnected, otherwise true
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
        }
    }

    exports.message = message;

})(typeof exports === 'undefined'? this['messages']={}: exports);
