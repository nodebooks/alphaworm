(function() {
  var Food = (function() {
    var Food = function(location, character) {
      this.location = location;
      this.color = "red";
      this.growth = 1; // Growth per food
    };

    Food.prototype.getColor = function() {
      return this.color;
    };

    Food.prototype.getCharacter = function() {
      return this.color;
    };
    return Food;
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Food;
  else
    window.Food = Food;
})();