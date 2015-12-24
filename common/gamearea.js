(function(){

  var GameArea = (function() {
    var GameArea = function() {
      this.cells = {};
      this.height = 40;
      this.width = 40;
      this.color = "lightblue"; // Game area color
    };

    GameArea.prototype.getHeight = function() {
      return this.height;
    };

    GameArea.prototype.getWidth = function() {
      return this.width;
    };
    return GameArea;
  })();

  if (typeof module !== 'undefined' && 
      typeof module.exports !== 'undefined')
    module.exports = GameArea;
  else
    window.GameArea = GameArea;
})();

