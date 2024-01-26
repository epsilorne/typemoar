var wordsArray;

var testRunning = false;
var inputField;

// Gets the 10,000 word list and places it into an array, though it is pretty janky
function prepareWordsArray(){
    alert("Started!")
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt", false);
    xmlhttp.send();
    if(xmlhttp.status == 200){
        wordsArray = xmlhttp.responseText;
    }
    alert(wordsArray);
}

// Intialisation
$(document).ready(function(){
    inputField = $("#inputField");
    inputField.focus();

    prepareWordsArray();
})

// Once we start typing, switch focus to the typing field to begin the test
$(document).keypress(function(){
    inputField.focus()
    
    if(!testRunning){
        testRunning = true;
    }
})