var wordsArray;

// Shorthand for the input field element
var inputField;

var testStart = false;
var testEnd = false;
var wordsToGenerate = 10;

// An array containing all characters (words) to be typed
var targetWords = [];

// String representation of the above array
var targetSentence;

// The current word to be typed
var targetWord;
var targetIndex = 0;



// Total mistakes made
var totalMistakes = 0;



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
    targetSentence = targetWords.join(" ");
    $("#targetText").prop("innerHTML", targetSentence);
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
    alert("Finished!");
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
})

// Once we start typing, switch focus to the typing field to begin the test
$(document).keypress(function(e){
    console.log("curent word: " + targetWord + " with mistakes: " + totalMistakes);
    
    inputField.focus()
    
    if(!testStart){
        testStart = true;
    }

    if(!testEnd){
        var currentInput = inputField.prop("value");
        var index = currentInput.length - 1;
    
        // When the space key is pressed, move to the next word ONLY IF the user
        // has at least typed one character
        if(e.key === " "){
            if(currentInput.length > 0){
                // Add the difference in length to the total mistakes (will be 0 if correct length ofc)
                totalMistakes += Math.abs(currentInput.length - targetWord.length);
                inputField.prop("value", null);

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
            }

            console.log(currentInput + " and " + targetWord);

            // If the user has typed the last word correctly, automatically finish the test
            if(currentInput == targetWord && targetIndex == wordsToGenerate - 1){
                finishTest();
            }
        }
    }
})