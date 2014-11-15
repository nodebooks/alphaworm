(function() {  
  var Worm = (function() {
      var Worm = function(name, number) {
        var color = ["blue", "green", "orange", "brown", "red", "black"];
        var self = this;

        self.alive = true; // true / false
        self.name = name;
        self.color = color[number]; // Pick a color for the worm
        self.startingLength = 5;
        self.length = self.startingLength;
        self.location = [];
        self.direction = "right"; // Direction: right, left, up, down
        self.newDirection = "right";
        self.velocity = 1;
        self.score = 0;

        // Initialize worm
        for(var x=0; x<self.startingLength; x++) {
          self.location[x] = x+number*8*30;
        }

        //console.log("worm", name, "location:", self.location);
      }
      return Worm;
    })();
    
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Worm;
  else
    window.Worm = Worm;
})();