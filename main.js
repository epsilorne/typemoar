var wordsToGenerate = 10;

var wordDatabase;
var timer;

// Shorthand for the input field element
var inputField;

var testStarted;
var testEnded;

// An array containing all characters (words) to be typed
var words;

// The current word to be typed
var targetWord;
var currentIndex;

// Test stats
var totalTime;
var totalMistakes;
var totalUncorrectedMistakes;
var correctCharacters;
var grossWPM;
var netWPM;

var bestWPM;

// Mistakes are tracked per-word using a string representation
var currentMistakes;


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

    // Create a span for each word in the array
    for(let i = 0; i < words.length; i++){
        var span = document.createElement("span");
        
        span.id = i;
        span.innerText = words[i] + " ";
        $("#targetText").append(span);
    }
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
    inputField.prop("disabled", true);

    // Stop the timer
    clearTimeout(timer);

    // Calculating results
    // Spaces are included in character count, but excluded in accuracy (to avoid inflation)
    var spaces = wordsToGenerate - 1;
    var charaCount = words.join("").length + spaces
    var acc = (((charaCount - totalMistakes - spaces) / (charaCount - spaces)) * 100).toFixed(1);
    var seconds = totalTime / 10;
    var mins = seconds / 60;

    grossWPM = (charaCount / 5) / mins;
    netWPM = grossWPM - (totalUncorrectedMistakes / mins);

    // Prevents negative WPM
    if(netWPM <= 0){ 
        netWPM = 0;
    }

    var setPB = false;

    // Set a new best WPM if appropriate
    if(netWPM > bestWPM){
        bestWPM = netWPM;
        localStorage.setItem("bestWPM", netWPM);
        setPB = true;
    }

    var wpmResults = `
                        WPM: ${Math.round(netWPM)}<br>
                        <small>(${Math.round(grossWPM)} raw)</small><br>
    `

    var accTimeResults = `
                        ${acc}% Accuracy<br>
                        ${seconds} Seconds
    `

    var gradeResults = `<h1>${calculateGrade(acc)}</h1>`
    var recordResults = `Record: ${Math.round(bestWPM)}WPM`

    if(setPB){
        recordResults += "<br><small>(that's a new record!)</small>";
    }
    
    $("#wpm").prop("innerHTML", wpmResults);
    $("#accTime").prop("innerHTML", accTimeResults);
    $("#grade").prop("innerHTML", gradeResults);
    $("#record").prop("innerHTML", recordResults);

    $("#container").hide();
    $("#results").fadeIn(100);
}

// Returns a letter-grade based on the user's accuracy
// Not to be taken seriously!
function calculateGrade(acc){
    if(acc == 100){
        return "<span style='color: rgb(230, 203, 99); font-size: 100px; line-height: 5%'>SS</span>";
    }
    else if(acc >= 99 && acc < 100){
        return "<span style='color: rgb(230, 203, 99); font-size: 100px; line-height: 5%'>S</span>";
    }
    else if(acc >= 97 && acc < 99){
        return "<span style='color: rgb(88, 191, 67); font-size: 100px; line-height: 5%'>A</span>";
    }
    else if(acc >= 95 && acc < 97){
        return "<span style='color: rgb(61, 169, 196); font-size: 100px; line-height: 5%'>B</span>";
    }
    else if(acc >= 90 && acc < 95){
        return "<span style='color: rgb(138, 85, 224); font-size: 100px; line-height: 5%'>C</span>";
    }
    else if(acc >= 85 && acc < 90){
        return "<span style='color: rgb(201, 46, 80); font-size: 100px; line-height: 5%'>D</span>";
    }
    else{
        return "<span style='color: rgb(201, 46, 80); font-size: 100px; line-height: 5%'>F</span>";
    }
}

// Cycles to the next word
function nextWord(){
    if(currentIndex < words.length - 1){
        // If the word was typed correctly, remove any highlighting
        if($("#" + currentIndex).attr("class") != "incorrectWord"){
            $("#" + currentIndex).removeClass("currentWord");
            $("#" + currentIndex).addClass("oldWord");
        }

        currentIndex++;
        targetWord = words[currentIndex];

        // Highlight the next word immediately
        $("#" + currentIndex).addClass("currentWord");

        // Start showing future words
        $("#" + parseInt(currentIndex + 21)).fadeIn();
    }
}

// Restarts all test-related variables, generates words and awaits user input
function setupTest(){
    $("#results").hide();
    $("#container").fadeIn();
    $("#settings").show();
    
    wordsToGenerate = parseInt(localStorage.getItem("wordsToGenerate")) || 10;

    words = [];
    testStarted = false;
    testEnded = false;
    currentIndex = 0;

    totalTime = 0;
    totalMistakes = 0;
    totalUncorrectedMistakes = 0;
    correctCharacters = 0;
    grossWPM = 0;

    bestWPM = parseInt(localStorage.getItem("bestWPM")) || 0;
    setPB = 0;

    currentMistakes = [];

    $("#targetText").empty();

    inputField.prop("disabled", false);
    inputField.prop("placeholder", "begin typing...");
    inputField.focus();
    
    // Disable event handlers so we don't make new ones when restarting
    inputField.off("input");
    inputField.off("keypress");

    prepareCurrentWords();
    prepareTest();
    highlightButtons();
    checkForInputs();

    // Highlight the starting word
    $("#0").addClass("previewWord");
}

// Highlights the appropriate button depending on 'wordsToGenerate'
function highlightButtons(){
    if(wordsToGenerate == 10){
        $("#button10").addClass("selectedButton");

        $("#button25").removeClass("selectedButton");
        $("#button50").removeClass("selectedButton");
        $("#button100").removeClass("selectedButton");
    }
    else if(wordsToGenerate == 25){
        $("#button25").addClass("selectedButton");

        $("#button10").removeClass("selectedButton");
        $("#button50").removeClass("selectedButton");
        $("#button100").removeClass("selectedButton");
    }
    else if(wordsToGenerate == 50){
        $("#button50").addClass("selectedButton");

        $("#button10").removeClass("selectedButton");
        $("#button25").removeClass("selectedButton");
        $("#button100").removeClass("selectedButton");
    }
    else if(wordsToGenerate == 100){
        $("#button100").addClass("selectedButton");

        $("#button10").removeClass("selectedButton");
        $("#button25").removeClass("selectedButton");
        $("#button50").removeClass("selectedButton");
    }
}

function regenerateWords(count){
    wordsToGenerate = count;
    localStorage.setItem("wordsToGenerate", count);
    setupTest();
}

// Start and update the timer every 100ms
function updateTimer(){
    totalTime++;
    timer = setTimeout(updateTimer, 100);
}

// Calculates the number of mismatching characters between strings
// Here, it's used to calculate uncorrected mistakes for each word
function calculateDifference(input, target){
    const maxLength = Math.max(input.length, target.length);
    var diffCount = 0;
    
    for(let i = 0; i < maxLength; i++){
        if(input.charAt(i) != target.charAt(i)){
            diffCount++;
        }
    }

    return diffCount;
}

// Intialisation
$(document).ready(function(){  
    inputField = $("#inputField");
    inputField.focus();

    prepareWordsArray();
    setupTest();
})

// Required to check user inputs for the input-field
function checkForInputs(){   
    // Set focus to the typing field when any input is detected
    $(document).on("keypress", function(){
        inputField.focus();
        $("#0").removeClass("previewWord");
        if($("#settings").is(":visible")){
            $("#settings").fadeOut(200);
        }
        $("#" + currentIndex).addClass("currentWord");
    })
    
    // Once we start typing, begin the test
    inputField.on("input", function(){
        var currentInput = inputField.prop("value");

        
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
                    // Remove the entered space from the input
                    currentInput = currentInput.trimEnd();
                    
                    // If the user has typed the word too short, add the number of
                    // missing characters to totalMistakes
                    if(currentInput.length < targetWord.length){
                        totalMistakes += targetWord.length - currentInput.length;
                    }
                    inputField.prop("value", null);

                    var oldMistakes = totalUncorrectedMistakes;

                    // Add the uncorrected mistakes, then reset the mistakes counter
                    totalUncorrectedMistakes += calculateDifference(currentInput, targetWord);
                    currentMistakes = [];

                    // Remove incorrect highlighting if all mistakes were fixed
                    if(oldMistakes - totalUncorrectedMistakes == 0){
                        $("#" + currentIndex).removeClass("incorrectWord");
                        $("#" + currentIndex).addClass("currentWord");
                    }
                    // Otherwise use the old incorrect highlighting
                    else{
                        $("#" + currentIndex).removeClass("incorrectWord");
                        $("#" + currentIndex).addClass("incorrectOldWord");
                    }

                    // Finish the test if we're on the last word, otherwise cycle thru
                    if(currentIndex == wordsToGenerate - 1){
                        finishTest();
                    }
                    else{
                        nextWord();
                    }
                }
                else{
                    // This prevents the space from being entered into the input field
                    return false;
                }
            }
            else{
                // If at some point, the user has typed the word correctly, remove incorrect highlighting
                if(currentInput.substring(0, index + 1) == targetWord.substring(0, index + 1)){
                    $("#" + currentIndex).removeClass("incorrectWord");
                    $("#" + currentIndex).addClass("currentWord");
                }
                
                var inputChar = currentInput.charAt(index);
                var targetChar = targetWord.charAt(index);
        
                if(inputChar != targetChar){
                    // Create an string representation of the current mistake
                    var mistake = index + inputChar + targetChar;

                    // We check if the mistake has been registered yet, to prevent
                    // duplicates if the user attempts to correct it
                    if(!currentMistakes.includes(mistake)){
                        // Highlight incorrect word
                        $("#" + currentIndex).removeClass("currentWord");
                        $("#" + currentIndex).addClass("incorrectWord");

                        currentMistakes.push(mistake);
                        totalMistakes++;
                    }
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