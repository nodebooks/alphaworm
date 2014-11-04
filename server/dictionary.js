var Dictionary = function() {

var self = this;

self.characters = "abcdefghujklmnopqrstuvwxyzäöå";
  self.currentWord = undefined; // Format: {from, to, answer}

  self.word = [ {english: "dog", finnish: "koira", swedish: "hund"},
                {english: "worm", finnish: "mato", swedish: "mask"},
                {english: "frog", finnish: "sammakko", swedish: "groda"},
                {english: "butterfly", finnish: "perhonen", swedish: "fjäril"},
                {english: "cat", finnish: "kissa", swedish: "katt"},
                {english: "reindeer", finnish: "poro", swedish: "ren"},
                {english: "bat", finnish: "lepakko", swedish: "battermus"},
                {english: "hedgehog", finnish: "siili", swedish: "igelkott"},
                {english: "cow", finnish: "lehmä", swedish: "ko"},
                {english: "horse", finnish: "hevonen", swedish: "häst"},
                {english: "bird", finnish: "lintu", swedish: "fågel"},
                {english: "eagle", finnish: "kotka", swedish: "örn"},
                {english: "fish", finnish: "kala", swedish: "fish"},
                {english: "sheep", finnish: "lammas", swedish: "får"},
                {english: "pig", finnish: "porsas", swedish: "gris"},
                {english: "chicken", finnish: "kana", swedish: "höns"},
                {english: "crocodile", finnish: "krokotiili", swedish: "krokodil"},
                {english: "penguin", finnish: "pingviini", swedish: "pingvin"},
                {english: "bear", finnish: "karhu", swedish: "björn"},
                {english: "elephant", finnish: "elefantti", swedish: "elefant"},
                {english: "giraffe", finnish: "kirahvi", swedish: "giraff"},
                {english: "lion", finnish: "leijona", swedish: "lejon"},
                {english: "fox", finnish: "kettu", swedish: "räv"},
                {english: "pheasant", finnish: "fasaani", swedish: "fasan"},
                {english: "lynx", finnish: "ilves", swedish: "lodjur"},
                {english: "pigeon", finnish: "kyyhky", swedish: "duva"}
  ];


  self.getNewWord = function(fromLanguage, toLanguage) {
    var languages = self.word[0];

    if(fromLanguage in languages && toLanguage in languages) {
      console.log("Found", fromLanguage, "and", toLanguage);

      var index = Math.floor(Math.random()*self.word.length);
      self.currentWord = {from: self.word[index][fromLanguage], 
      to: self.word[index][toLanguage], 
      answer: self.word[index][toLanguage].replace(/[a-ö]/g, "_")};

      return self.currentWord;
    }
    else {
      console.log("ERROR: Invalid language selected:", fromLanguage, toLanguage);
    }
    // Exit if something fails: not an elegant way, more like an example
    console.log("Killing process.")
    process.kill();
  },

  self.checkCharacter = function(character) {
    console.log("dictionary.checkCharacter:", character, self.currentWord);
    // Iterate through available characters in current word
    for(var x=0; x<self.currentWord["to"].length; x++) {
      console.log("x:", x);
      if (self.currentWord["to"][x] == character && self.currentWord["answer"][x] == "_") {
        console.log("found", self.currentWord["to"][x]);
        
        var s = self.currentWord["answer"];
        self.currentWord["answer"] = s.substring(0,x) + character + s.substring(x+1);
        // Check if we've finished the word
        if ((self.currentWord["to"].indexOf(self.currentWord["answer"]) > -1)) {
            // This was the last character, return 0
            console.log("word ready");
            return 0;
        }
        //console.log("self.currentWord["answer"], self.currentWord["answer"];
        return 1; // Add one point
      }
      else {
        console.log("fails:", self.currentWord["to"][x]);
      }
    }
    console.log(character, "char", character, "did not match", self.currentWord["answer"]);
    return -1; // Remove one point
  },

  self.getRandomCharacter = function() {
    //console.log("dictionary.getRandomCharacter");
    return self.characters[Math.floor(Math.random()*self.characters.length)];
  },

  self.getCurrentWord = function() {
    return self.currentWord;
  },

  self.getAnswer = function() {
    return self.currentWord["answer"];
  }
}

// Some code for testing, uncomment and run 'node dictionary.js'
/*
var dict = new Dictionary();
var word = dict.getNewWord("finnish", "english");
console.log(word);
console.log("answer:", word["answer"]);
console.log("checkCharacter(a):", dict.checkCharacter('a'));

console.log("getAnswer()", dict.getAnswer().toUpperCase());
*/
module.exports = Dictionary;