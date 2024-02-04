var wordsArray;

var testRunning = false;
var inputField;

// A string containing all characters (words) to be typed
var currentWords;

// Gets the 10,000 word list and places it into an array, though it is pretty janky
function prepareWordsArray(){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://raw.githubusercontent.com/epsilorne/typemoar/main/words.txt", false);
    xmlHttp.send();
    if(xmlHttp.status == 200){
        wordsArray = xmlHttp.responseText.split("\n");
    }
}

// Randomly generates a given number of words, then sets the display text and currentWords to the
// words
function prepareCurrentWords(wordCount){
    for(let i = 0; i < wordCount; i++){
        appendRandomWord();
    }

    $("#currentText").prop("innerHTML", currentWords)
}

// Return a random word from the big array
function returnRandomWord(){
    return wordsArray[Math.floor(Math.random() * wordsArray.length)];
}

// Append a random word to the currentWords string
function appendRandomWord(){
    if(currentWords == undefined){
        currentWords = returnRandomWord();
    }
    else{
        currentWords = currentWords.concat(" " + returnRandomWord());
    }
}

// Intialisation
$(document).ready(function(){
    inputField = $("#inputField");
    inputField.focus();

    prepareWordsArray();
    prepareCurrentWords(10);
})

// Once we start typing, switch focus to the typing field to begin the test
$(document).keypress(function(){
    inputField.focus()
    
    if(!testRunning){
        testRunning = true;
    }
})