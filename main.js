// What mode is the test? 0 = words, 1 = time
var testMode = 0;

var wordsToGenerate;
var testDuration;
var wordsPerSentence = 10;

var wordDatabase;
var timer;

// Shorthand for the input field element
var inputField;

var testStarted, testEnded;

// An array containing all characters (words) to be typed
var words;

// The current word to be typed
var targetWord;

// Information about the current word, line and what word the line starts
var currentIndex, currentLine, newLineIndex;

// Test stats
var totalTime, totalMistakes, totalUncorrectedMistakes, correctCharacters, grossWPM, netWPM, bestWPM;

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
function generateWords(count){ 
    // We keep track of the old word count so spans are only made for new words
    oldWordCount = words.length;

    for(let i = 0; i < count; i++){
        words.push(wordDatabase[Math.floor(Math.random() * wordDatabase.length)]);
    }

    // Create a span for each word in the array
    for(let i = oldWordCount; i < words.length; i++){
        var span = document.createElement("span");
    
        span.id = i;
        span.innerText = words[i] + " ";
        $("#targetText").append(span);
    }
}

function changeTestMode(){
    testMode = testMode == 0 ? 1 : 0;
}

function finishTest(){
    testEnded = true;
    inputField.prop("disabled", true);

    // Stop the timer
    clearTimeout(timer);
    if(testMode == 1){ totalTime = testDuration * 10; }

    // Calculating results
    // Spaces are included in character count, but excluded in accuracy (to avoid inflation)
    var spaces = wordsToGenerate - 1;

    // TODO: Change charaCount so it only counts what has actually been typed
    var charaCount = words.join("").length + spaces
    var acc = (((charaCount - totalMistakes - spaces) / (charaCount - spaces)) * 100).toFixed(1);
    var seconds = totalTime / 10;
    var mins = seconds / 60;

    grossWPM = (charaCount / 5) / mins;
    netWPM = grossWPM - (totalUncorrectedMistakes / mins);

    // Prevents negative WPM
    if(netWPM <= 0){ netWPM = 0; }

    var setPB = false;

    // Set a new best WPM if appropriate
    if(netWPM > bestWPM){ bestWPM = netWPM; localStorage.setItem("bestWPM", netWPM); setPB = true; }

    var wpmResults = `WPM: ${Math.round(netWPM)}<br><small>(${Math.round(grossWPM)} raw)</small><br>`
    var accTimeResults = `${acc}% Accuracy<br>${seconds} Seconds`
    var gradeResults = `<h1>${calculateGrade(acc)}</h1>`
    var recordResults = `Record: ${Math.round(bestWPM)}WPM`

    if(setPB){ recordResults += "<br><small>(that's a new record!)</small>"; }
    
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
    var grades = [
        {grade: 'SS', color: 'rgb(230, 203, 99)', thres: 100},
        {grade: 'S', color: 'rgb(230, 203, 99)', thres: 99},
        {grade: 'A', color: 'rgb(88, 191, 67)', thres: 98},
        {grade: 'B', color: 'rgb(61, 169, 196)', thres: 95},
        {grade: 'C', color: 'rgb(138, 85, 224)', thres: 90},
        {grade: 'D', color: 'rgb(201, 46, 80)', thres: 85},
        {grade: 'F', color: 'rgb(201, 46, 80)', thres: 0},
    ];

    for(let i = 0; i < grades.length; i++){
        if(acc >= grades[i].thres){
            return `<span style='color: ${grades[i].color}; font-size: 100px; line-height: 5%'>${grades[i].grade}</span>`
        }
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

        // If the vert. position of the new word is different to the previous word,
        // we're on a new line. If so, then generate more words. NOTE THIS ONLY
        // APPLIES FOR TIME-BASED TESTS
        if(testMode == 1 && $("#" + newLineIndex).offset().top != $("#" + currentIndex).offset().top){
            oldLineIndex = newLineIndex;
            newLineIndex = currentIndex;

            generateWords(wordsPerSentence);
            wordsToGenerate += wordsPerSentence;

            // Delete the previously typed line span. Note we do not delete
            // the actual words, as that will mess up test results
            for(let i = oldLineIndex; i < newLineIndex; i++){
                $("#" + i).remove();
            }
        }
    }
}

// Restarts all test-related variables, generates words and awaits user input
function setupTest(){
    $("#results").hide();
    $("#container").fadeIn();
    $("#settings").show();
    
    wordsToGenerate = parseInt(localStorage.getItem("wordsToGenerate")) || 10;
    testDuration = parseInt(localStorage.getItem("testDuration")) || 15;
    testMode = parseInt(localStorage.getItem("testMode")) || 0;
    bestWPM = parseInt(localStorage.getItem("bestWPM")) || 0;

    words = [];
    testStarted = false;
    testEnded = false;
    currentIndex = 0;
    currentLine = 0;
    newLineIndex = 0;

    // If the test-mode is time, the time starts negative and counts up
    totalTime = testMode == 0 ? 0 : -testDuration * 10;
    totalMistakes = 0;
    totalUncorrectedMistakes = 0;
    correctCharacters = 0;
    grossWPM = 0;
    setPB = false;

    currentMistakes = [];

    $("#targetText").empty();

    inputField.prop("disabled", false);
    inputField.prop("placeholder", "begin typing...");
    inputField.prop("value", null);
    inputField.focus();
    
    // Disable event handlers so we don't make new ones when restarting
    inputField.off("input");
    inputField.off("keypress");

    generateWords(wordsToGenerate);
    targetWord = words[0];
    checkForInputs();

    // Highlight the starting word
    $("#0").addClass("previewWord");
    $(".settingsButton").removeClass("selectedButton");
    $(".settingsButton").prop("disabled", false);
    
    // Highlights a settings button to show the current mode
    // Below refers to the fixed-number of words test
    if(testMode == 0){
        $("#button" + wordsToGenerate).addClass("selectedButton");
        $("#timerText").prop("innerHTML", "");
    }
    else{
        $("#button" + testDuration + "s").addClass("selectedButton");
        $("#timerText").prop("innerHTML", testDuration + '.0"');
    }
}


function generateWordsTest(count){
    testMode = 0;

    wordsToGenerate = count;
    localStorage.setItem("wordsToGenerate", count);
    localStorage.setItem("testMode", 0);

    setupTest();
}

function generateTimeTest(duration){
    testMode = 1;
    
    wordsToGenerate = 16;
    testDuration = duration;

    localStorage.setItem("wordsToGenerate", wordsToGenerate);
    localStorage.setItem("testDuration", duration);
    localStorage.setItem("testMode", 1);

    setupTest();
}

// Start and update the timer every 100ms
function updateTimer(){
    // Subtract or add time depending on the test mode
    totalTime++;
    timer = setTimeout(updateTimer, 100);

    // Update the timer text and finish the test if appropriate
    if(testMode == 1){
        $("#timerText").prop("innerHTML", Math.abs(totalTime / 10).toFixed(1) + '"');
        if(totalTime >= 0){
            finishTest();
        }
    }
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
            $(".settingsButton").prop("disabled", true);
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