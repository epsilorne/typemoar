var wordsArray;

// Shorthand for the input field element
var inputField;

var testStart = false;
var testEnd = false;
var wordsToGenerate = 10;

// An array containing all characters (words) to be typed
var targetWords = [];

// The current word to be typed
var targetWord;
var targetIndex = 0;

// Test stats
var totalMistakes = 0;
var correctCharacters = 0;
var grossWPM;


// Gets the 10,000 word list and places it into an array, though it's janky
function prepareWordsArray(){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://raw.githubusercontent.com/epsilorne/typemoar/main/words.txt", false);
    xmlHttp.send();
    if(xmlHttp.status == 200){
        wordsArray = xmlHttp.responseText.split("\n");
    }
}

// Randomly generates a given number of words as an array and string
function prepareCurrentWords(){
    for(let i = 0; i < wordsToGenerate; i++){
        targetWords.push(returnRandomWord());
    }
    $("#targetText").prop("innerHTML", targetWords.join(" "));
}

// Return a random word from the big array
function returnRandomWord(){
    return wordsArray[Math.floor(Math.random() * wordsArray.length)];
}

function prepareTest(){
    targetWord = targetWords[0];
}

function finishTest(){
    testEnd = true;
    inputField.prop("value", null);
    inputField.prop("disabled", "true");

    // Calculating results
    var charaCount = targetWords.join("").length;
    var accuracy = Math.round(((charaCount - totalMistakes) / charaCount) * 100);
    alert("Finished! Accuarcy: " + accuracy + "%");
}

// Cycles to the next word
function nextWord(){
    if(targetIndex < targetWords.length - 1){
        targetIndex++;
        targetWord = targetWords[targetIndex];
    }
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
    $("#inputField").on("input", function(){
        var currentInput = inputField.prop("value");

        console.log("curent word: " + targetWord + " with mistakes: " + totalMistakes);
        
        inputField.focus()
        
        if(!testStart){
            testStart = true;
        }

        if(!testEnd){
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
                    if(targetIndex == wordsToGenerate - 1){
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
                if(currentInput == targetWord && targetIndex == wordsToGenerate - 1){
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