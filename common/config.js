(function(exports){

  var dictionary = function() {
    var self = this;

    self.currentWord = {english: null, finnish: null, answer: null};
    self.freeLetters = null;
    self.letters = "abcdefghujklmnopqrstuvwxyzäöå";
    self.word = [
    {english: "dog", finnish: "koira", swedish: "hund"},
    {english: "worm", finnish: "mato", swedish: "mask"},
    {english: "frog", finnish: "sammakko", swedish: "groda"},
    {english: "butterfly", finnish: "perhonen", swedish: "fjäril"},
    {english: "cat", finnish: "kissa", swedish: "katt"},
    {english: "reindeer", finnish: "poro", swedish: "ren"},
    {english: "bat", finnish: "lepakko", swedish: "battermus"},
    {english: "hedgehog", finnish: "siili", swedish: "asdf"},
    {english: "cow", finnish: "lehmä", swedish: "asdf"},
    {english: "horse", finnish: "hevonen", swedish: "asdf"},
    {english: "bird", finnish: "lintu", swedish: "asdf"},
    {english: "eagle", finnish: "kotka", swedish: "asdf"},
    {english: "fish", finnish: "kala", swedish: "asdf"},
    {english: "sheep", finnish: "lammas", swedish: "asdf"},
    {english: "pig", finnish: "porsas", swedish: "asdf"},
    {english: "chicken", finnish: "kana", swedish: "asdf"},
    {english: "crocodile", finnish: "krokotiili", swedish: "asdf"},
    {english: "penguin", finnish: "pingviini", swedish: "asdf"},
    {english: "bear", finnish: "karhu", swedish: "asdf"},
    {english: "elephant", finnish: "elefantti", swedish: "asdf"},
    {english: "giraffe", finnish: "kirahvi", swedish: "asdf"},
    {english: "lion", finnish: "leijona", swedish: "asdf"},
    {english: "fox", finnish: "kettu", swedish: "asdf"},
    {english: "pheasant", finnish: "fasaani", swedish: "asdf"},
    {english: "lynx", finnish: "ilves", swedish: "asdf"}
    ];

    self.pickNewWordFinToEng = function() { // Show Finnish word and pick letters to English word
      var word = self.currentWord.english = null;
      var index = 0;
      while(self.currentWord.english == word) {
        index = Math.floor(Math.random()*self.word.length);
        //console.log("index", index);
        //console.log("word", self.word[index]);
        word = self.word[index].english;
      }
      self.currentWord = {english: self.word[index].english, finnish: self.word[index].finnish, answer: self.word[index].english};
      self.currentWord.answer = self.currentWord.english.replace(/[a-ö]/g, "_");
      //console.log("dictionary.pickNewWordFinToEng", self.currentWord);

      return self.word[index].english;
    },

    self.checkLetter = function(letter) {
      //console.log("dictionary.checkLetter:", letter);
      // Iterate through available words in current word
      for(var x=0; x<self.currentWord.answer.length; x++) {
        //console.log("checking", self.currentWord.english[x], "==", self.currentWord.answer[x]);

        if (self.currentWord.english[x] == letter && self.currentWord.answer[x] == "_") {
          var s = self.currentWord.answer;
          self.currentWord.answer = s.substring(0,x) + letter + s.substring(x+1);

          // Check if we've finished the word
          if ((self.currentWord.english.indexOf(self.currentWord.answer) > -1)) {
            // This was the last letter, return 0
            //console.log("word ready");
            return 0;
          }
          return 1; // Add one point
        }
      }
      //console.log(letter, "did not match");
      return -1; // Remove one point
    },

    self.getCurrentWord = function() {
      //console.log("dictionary.getCurrentWord");
      return self.currentWord;
    },

    self.randomLetter = function() {
      //console.log("dictionary.randomLetter");
      return self.letters[Math.floor(Math.random()*self.letters.length)];
    }
  }

  var worm = function(name, number) {
    var color = ["blue", "green", "orange", "brown"];
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
      self.location[x] = x+number*8*40;
    }

    //console.log("worm", name, "location:", self.location);
  }

  var food = function(location) {
    var self = this;
    self.letter = null;
    self.isPartOf = false;
    self.location = location;
    self.color = "white";
    self.growth = Math.floor(Math.random()*1+1); // Growth per food
  }

  var gameArea = function() {
    var self = this;
    self.cells = {};
    self.height = 30;
    self.width = 30;
    self.color = "lightblue"; // Game area color
  }


})(typeof exports === 'undefined'? this['config']={}: exports);