var wordDatabase;
var timer;

// Shorthand for the input field element
var inputField;

var testStarted = false;
var testEnded = false;
var wordsToGenerate = 10;

// An array containing all characters (words) to be typed
var words = [];

// The current word to be typed
var targetWord;
var currentIndex = 0;

// Test stats
var totalTime = 0;
var totalMistakes = 0;
var uncorrectedMistakes = 0;
var correctCharacters = 0;
var grossWPM = 0;


// Gets the 10,000 word list and places it into an array, though it's janky
function prepareWordsArray(){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://raw.githubusercontent.com/epsilorne/typemoar/main/words.txt", false);
    xmlHttp.send();
    if(xmlHttp.status == 200){
        wordDatabase = xmlHttp.responseText.split("\n");
    }
}

// Randomly generates a given number of words as an array and string
function prepareCurrentWords(){
    for(let i = 0; i < wordsToGenerate; i++){
        words.push(returnRandomWord());
    }
    $("#targetText").prop("innerHTML", words.join(" "));
}

// Return a random word from the big array
function returnRandomWord(){
    return wordDatabase[Math.floor(Math.random() * wordDatabase.length)];
}

function prepareTest(){
    targetWord = words[0];
}

function finishTest(){
    testEnded = true;
    inputField.prop("value", null);
    inputField.prop("disabled", "true");

    // Stop the timer
    clearTimeout(timer);

    // Calculating results
    // We add (n - 1) for charaCount to account for spaces in the sentence
    var charaCount = words.join("").length + wordsToGenerate - 1;
    var acc = Math.round(((charaCount - totalMistakes) / charaCount) * 100);
    var seconds = totalTime / 10;

    grossWPM = Math.round((charaCount / 5) / (seconds / 60));
    alert(`Gross WPM: ${grossWPM}\nAccuracy: ${acc}%\nTime: ${seconds}"`);
}

// Cycles to the next word
function nextWord(){
    if(currentIndex < words.length - 1){
        currentIndex++;
        targetWord = words[currentIndex];
    }
}

function countUncorrectedMistakes(){

}

// Start and update the timer every millisecond
function updateTimer(){
    totalTime++;
    timer = setTimeout(updateTimer, 100);
}

// Intialisation & character checking
$(document).ready(function(){  
    inputField = $("#inputField");
    inputField.focus();

    prepareWordsArray();
    prepareCurrentWords();
    prepareTest();

    checkForInputs();
})

// Required to check user inputs for the input-field
function checkForInputs(){   
    // Once we start typing, switch focus to the typing field to begin the test
    inputField.on("input", function(){
        var currentInput = inputField.prop("value");
        
        inputField.focus()
        
        if(!testStarted){
            testStarted = true;
            inputField.prop("placeholder", "");
            updateTimer();
        }

        if(!testEnded){
            var index = currentInput.length - 1;
        
            // When the space key is pressed, move to the next word ONLY IF the user
            // has at least typed one character
            if(currentInput.charAt(index) === " "){
                if(currentInput.length > 1){
                    // If the user has typed the word too short, add the number of
                    // missing characters to totalMistakes
                    if(currentInput.length < targetWord.length){
                        totalMistakes += targetWord.length - currentInput.length + 1;
                    }
                    inputField.prop("value", null);

                    // Finish the test if we're on the last word, otherwise cycle thru
                    if(currentIndex == wordsToGenerate - 1){
                        finishTest();
                    }
                    else{
                        nextWord();
                    }
            
                    // This prevents the space from being entered into the input field
                    return false;
                }
                else{
                    // This prevents the space from being entered into the input field
                    return false;
                }
            }
            else{
                var inputChar = currentInput.charAt(index);
                var targetChar = targetWord.charAt(index);
        
                if(inputChar != targetChar){
                    totalMistakes++;
                    console.log(inputChar + "' doesn't match with '" + targetChar + "'.")
                }
                else{
                    correctCharacters++;
                }

                // If the user has typed the last word correctly, automatically finish the test
                if(currentInput == targetWord && currentIndex == wordsToGenerate - 1){
                    finishTest();
                }
            }
        }
    })
    
    // Prevent the user from pressing space in an empty field
    $("#inputField").on("keypress", function(e){
        if(inputField.prop("value").length < 1 && e.key == " "){
            return false;
        }
    })
}