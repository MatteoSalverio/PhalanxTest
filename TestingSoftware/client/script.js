var colors = {
    agree: "rgb(51, 164, 116)",
    disagree: "rgb(136, 97, 154)",
    neutral: "rgb(81, 89, 106)"
}
var questionCount = 1;
const questionsDiv = document.getElementById("questions");
var dataList = "";
var currentQuestion = 1;

function toggleElement(popupId) { // Enables and disables a panel
    if (document.getElementById(popupId).style.visibility == "hidden")
        document.getElementById(popupId).style.visibility = "unset";
    else
        document.getElementById(popupId).style.visibility = "hidden";
}

function createButton(size, color, yOffset, questionNum, answerNum) { // Creates the circle answer buttons
    return btn = "<button id='question" + questionNum + ",answer" + answerNum + "' class='answer' style='width: " + size + "px; height: " + size + "px; border-color: " + color + "; background-color: " + 'rgba(0,0,0,0)' + "; bottom: " + yOffset + "px'></button>";
}

function createQuestion(question, id) { // Displays a question given it's text and index
    let temp = "";
    temp += '<div id="question' + id + '" class="questionBox">';
    temp += '<h2 class="question">' + question + '</h2>';
    temp += '<div id="answerSection' + questionCount + '" class="answerSection">';
    temp += "<h2 style='font-weight: normal; float: left; position: relative; top: 10px; right: 20px; color: " + colors.disagree + ";'>Strongly<br>Disagree</h2>";
    temp += "<h2 style='font-weight: normal; float: right; position: relative; top: 10px; left: 20px; color: " + colors.agree + ";'>Strongly<br>Agree</h2>";
    // Creating, positioning, and coloring the answer buttons
    let c = 5; // Labels the answer button with it's index
    for (let i = -2; i < 3; i++) {
        let color = colors.neutral;
        if (i > 0)
            color = colors.agree;
        else if (i < 0)
            color = colors.disagree;
        if (i != 0)
            yOffset = Math.abs(i) * -4;
        else
            yOffset = 0;
        temp += createButton(72 + Math.abs(i * 10), color, yOffset, id, c);
        c--;
    }
    temp += '</div>';
    temp += '</div><hr id="hr' + id + '">';
    questionsDiv.innerHTML += temp;
    questionCount++;
}

function loadQuestions() {
    questionsDiv.innerHTML = "";
    // Creates and displays all questions from the dataList
    if (urlData.answerText == null) { // Checks to see if this is the main user or the second user
        for (let i = 0; i < dataList.categories.length; i++) {
            for (let j = 0; j < dataList.categories[i].questions.length; j++)
                createQuestion(dataList.categories[i].questions[j].question, dataList.categories[i].questions[j].index);
        }
    }
    // If this is the second test taker
    else {
        for (let i = 0; i < dataList.categories.length; i++) {
            for (let j = 0; j < dataList.categories[i].questions.length; j++)
                createQuestion(dataList.categories[i].questions[j].flipped, dataList.categories[i].questions[j].index);
        }
    }

    // Handling answer buttons' actions
    let allAnswerButtons = document.getElementsByClassName("answer");
    for (let i = 0; i < allAnswerButtons.length; i++) {
        // When the user hovers over an answer button
        allAnswerButtons[i].addEventListener("mouseover", function (event) {
            event.target.style.backgroundColor = event.target.style.borderColor;
        });
        // When the user stops hovering over an answer
        allAnswerButtons[i].addEventListener("mouseout", function (event) {
            if (getQuestionFromIndex(event.target.id.split(",")[0].replace("question", "")).answer != event.target.id.split(",")[1].replace("answer", ""))
                event.target.style.backgroundColor = "rgba(0,0,0,0)";
        });
        // When the user clicks an answer
        allAnswerButtons[i].addEventListener("click", function (event) {
            let q = event.target.id.split(",")[0].replace("question", "");
            let a = event.target.id.split(",")[1].replace("answer", "");
            for (let i = 1; i <= 5; i++)
                document.getElementById("question" + q + ",answer" + i).style.backgroundColor = "rgba(0,0,0,0)";
            event.target.style.backgroundColor = event.target.style.borderColor;
            answer(q, a);
        });
    }
    document.getElementById("titleDisplay").innerHTML = dataList.testName;
    document.getElementById("welcomeMessage").innerHTML = "Welcome to the " + dataList.testName + "!";
    document.getElementById("descriptionDisplay").innerHTML = dataList.testDescription;
    document.title = dataList.testName;
    fadeAllExceptCurrent();
}

// Returns a question object when given it's category and category-based index
function getQuestionFromCategoryIndex(category, index) {
    for (let i = 0; i < dataList.categories.length; i++) {
        if (dataList.categories[i] == category)
            return dataList.categories[i].questions[index];
    }
    return "question not found";
}

// Returns a question object when given it's global index
function getQuestionFromIndex(index) {
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            if (dataList.categories[i].questions[j].index == index)
                return dataList.categories[i].questions[j];
        }
    }
    return "question not found";
}

// Fades every question
function fadeQuestions() {
    let c = 1;
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            document.getElementById("question" + c).style.opacity = "10%";
            c++;
        }
    }
}

// Makes all questions except the current one faded out
function fadeAllExceptCurrent() {
    let c = 1;
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            if (c != currentQuestion)
                document.getElementById("question" + c).style.opacity = "10%";
            else
                document.getElementById("question" + c).style.opacity = "100%";
            c++;
        }
    }
}

// Called when the user clicks on an answer button
function answer(question, answer) {
    getQuestionFromIndex(question).answer = answer; // Recored the user selection to the dataList
    let completion = Math.round(currentQuestion / (questionCount - 1) * 100) + "%";
    document.getElementById("progressBar").style.width = completion; // Changes the status of the progress bar at the top
    document.getElementById("percentage").innerHTML = completion;
    if (question >= questionCount - 1) { // If the user is on the last question
        document.getElementById("question" + (question * 1)).style.opacity = "100%"; // Make the current question not faded
        open("#finishButton", "_self"); // Scrolls down to the finish button
        return;
    }
    fadeQuestions(); // Fade all questions
    document.getElementById("question" + ((question * 1) + 1)).style.opacity = "100%"; // Make the current question not faded
    currentQuestion = (question * 1) + 1;
    open("#question" + question + ",answer1", "_self"); // Scrolls down to the next question
}

// Returns the amount of points that a button gives based on whether the question is worth negative or positive points
function getPoints(answerIndex, worth) {
    answerIndex *= 1;
    let positiveScores = [2, 1, 0, -1, -2];
    let negativeScores = [-2, -1, 0, 1, 2];
    if (worth == "+" || worth == "positive")
        return positiveScores[answerIndex]; // The -1 is because the buttons are labeled with the first index being 1, not 0
    else
        return negativeScores[answerIndex];
}

let encodedAnswers = "asdfghjklqwertyuiopzxcvbnm";
function decodeAnswer(encodedAnswer) {
    return encodedAnswers.indexOf(encodedAnswer);
}

function finish() {
    let urlString = "";
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            if (dataList.categories[i].questions[j].answer != "none")
                urlString += encodedAnswers[(dataList.categories[i].questions[j].answer * 1) - 1];
            else
                urlString += encodedAnswers[2];
        }
    }
    let originalAnswers = "";
    if (urlData.answerText != null) {
        originalAnswers = "?" + urlData.answerText;
        document.getElementById("whatToDo").innerHTML = "You can now send the link back to the original tester and they will get to review their results.";
    }
    document.getElementById("sendUrlLink").innerHTML = window.location.href.substring(0, window.location.href.indexOf("?") - 1) + "/?" + urlData.testId + "?" + urlString + originalAnswers;
    toggleElement("flippedExplanation");
}

function copyUrl() {
    navigator.clipboard.writeText(document.getElementById("sendUrlLink").innerHTML);
    document.getElementById("copyButton").innerHTML = "Link Copied";
    document.getElementById("copyButton").style.backgroundColor = "rgb(51, 164, 116)";
    sendEmail("matteosalverio@gmail.com", "Test Results Email", "This is a test, the link is: " + document.getElementById("sendUrlLink").innerHTML);
}

function sendEmail(toEmail, subject, body) {
    Email.send({
        Host: "smtp.gmail.com",
        Username: "training@phalanxssi.com",
        Password: "Enter your password",
        To: 'matteosalverio@gmail.com',
        From: "training@phalanxssi.com",
        Subject: subject,
        Body: body,
    })
        .then(function (message) {
            //alert("Mail has been sent successfully")
        });
}

var storedTestingPage = "";
var personalScores = [];
var otherScores = [];
// Calculates the final score for each category as a percentage
function calculateScore() {
    if (dataList.perspective == "both") {
        let qNum = 1; // Counts total number of questions
        let categoryScores = []; // Scores for each category
        let originalCategoryScores = [];
        let categoryPercents = []; // Stores the percentage calculation for each category
        let originalCategoryPercents = [];
        for (let i = 0; i < dataList.categories.length; i++) {
            categoryScores[i] = 0;
            originalCategoryScores[i] = 0;
            let categoryQuestionCount = 0; // Counts questions within this category
            for (let j = 0; j < dataList.categories[i].questions.length; j++) {
                // Get answer values from the URL:
                let originalAnswer = decodeAnswer(urlData.originalAnswerText[qNum - 1]); // "Your Results"
                let answer = decodeAnswer(urlData.answerText[qNum - 1]); // "Other Person"
                // Find the total score from each category:
                categoryScores[i] += getPoints(answer, dataList.categories[i].questions[j].worth);
                originalCategoryScores[i] += getPoints(originalAnswer, dataList.categories[i].questions[j].worth);
                // Count the question:
                qNum++;
                categoryQuestionCount++;
            }
            // Calculate percentages:
            categoryPercents[i] = Math.round(((categoryScores[i] + (categoryQuestionCount * 2)) / (categoryQuestionCount * 4)) * 100);
            originalCategoryPercents[i] = Math.round(((originalCategoryScores[i] + (categoryQuestionCount * 2)) / (categoryQuestionCount * 4)) * 100);

            // Set the base color of the cell
            let cellColor = [220, 140, 150, 0.5];
            let originalCellColor = [220, 140, 150, 0.5];

            // Set the color of the cell based on the score inside it
            originalCellColor[0] -= originalCategoryPercents[i] / 2;
            originalCellColor[1] += originalCategoryPercents[i];

            cellColor[0] -= categoryPercents[i] / 2;
            cellColor[1] += categoryPercents[i];

            let originalCssColor = "rgba(" + originalCellColor[0] + "," + originalCellColor[1] + "," + originalCellColor[2] + "," + originalCellColor[3] + ")";
            let cssColor = "rgba(" + cellColor[0] + "," + cellColor[1] + "," + cellColor[2] + "," + cellColor[3] + ")";

            // Add results to the table:
            document.getElementById("resultsTable").innerHTML += "<tr><td style='font-weight: bold; background-color: rgba(31,81,225,0.25); color: black;'>" + dataList.categories[i].name + "</td><td style='background-color: " + originalCssColor + ";'>" + originalCategoryPercents[i] + "%" + "</td><td style='background-color: " + cssColor + "'>" + categoryPercents[i] + "%" + "</td>";
        }

        let xValues = [];
        let yValues = [];
        let yValues2 = [];

        for (let i = 0; i < dataList.categories.length; i++) {
            xValues.push(dataList.categories[i].name);
            yValues.push(categoryPercents[i]);
            yValues2.push(originalCategoryPercents[i]);
        }

        let chart = new Chart("chart", {
            type: "bar",
            data: {
                labels: xValues,
                datasets: [
                    {
                        label: "How You Rated Yourself",
                        backgroundColor: "rgba(55, 100, 200, 0.75)",
                        borderColor: "rgba(55, 100, 200, 1)",
                        borderWidth: 3,
                        data: yValues2
                    },
                    {
                        label: "How Others See You",
                        backgroundColor: "rgba(55, 200, 130, 0.75)",
                        borderColor: "rgba(55, 200, 130, 1)",
                        borderWidth: 3,
                        data: yValues
                    }
                ]
            },
            options: {
                title: {
                    display: true,
                    text: "Visualize Your Test Results",
                    fontSize: 32
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        fontSize: 24
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            fontSize: 20,
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontSize: 20
                        }
                    }]
                },
                responsive: true
            }
        });

        document.getElementById("titleDisplay").innerHTML = "Your Testing Results:"
        toggleElement("mainTestPage");
        storedTestingPage = document.getElementById("mainTestPage").innerHTML;
        document.getElementById("mainTestPage").innerHTML = "";
        toggleElement("scoringPage");
        open("#title", "_self"); // Return to top of page
    }
}

function savePageAsPdf() {
    var element = document.getElementById('scoringPage');
    var opt = {
        margin: 10,
        filename: 'your-webpage.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { avoid: '.avoid-pagebreak' },
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
}


// Selects the far left answer choice for each question for testing purposes
function autoComplete() {
    let c = 1;
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            answer(c, 1);
            document.getElementById("question" + c + ",answer1").style.backgroundColor = document.getElementById("question" + c + ",answer1").style.borderColor;
            c++;
        }
    }
}

let urlData = {
    testId: null,
    answerText: null,
    originalAnswerText: null
}
function onlineStart() { // For if the site is on a server (or VSCode Live Server)
    let urlVars = window.location.href.split("?")
    urlData.testId = urlVars[1];
    if (urlVars.length > 2 && urlVars[2] != "")
        urlData.answerText = urlVars[2];
    if (urlVars.length > 3 && urlVars[3] != "")
        urlData.originalAnswerText = urlVars[3];

    console.log("Loading test '" + urlData.testId + "'");
    if (window.location.href.indexOf("?") < 0 || urlData.testId == "" || urlData.testId == null) {
        document.getElementById("titleDisplay").innerHTML = "Phalanx Testing Client";
        document.getElementById("welcomeMessage").innerHTML = "<span style=''>This page is blank, when you open a test, it will appear here.</span>";
        document.getElementById("descriptionDisplay").innerHTML = "To open a test, click the button below and input the ID of the test.";
        document.getElementById("finishButton").innerHTML = "Load Test From ID";
        document.getElementById("finishButton").onclick = function () {
            urlData.testId = prompt("What is the ID of the test you would like to open?");
            open(window.location.href + "?" + urlData.testId, "_self");
        }
        return;
    }
    loadTestFile(urlData.testId);
}

function loadTestFile(testId) {
    fetch('../tests/' + testId + '.json')
        .then(response => response.text())
        .then(data => {
            dataList = JSON.parse(data);
            loadQuestions();
            if (urlData.originalAnswerText != null) {
                calculateScore();
                return;
            }
            // Checks if the user is at a specific question and returns to the top when the page first loads
            if (window.location.href.indexOf("#") > -1)
                window.location.href = (window.location.href.substring(0, window.location.href.indexOf("#")));
        })
        .catch(err => {
            if (window.location.href.indexOf("#") > -1)
                window.location.href = (window.location.href.substring(0, window.location.href.indexOf("#")));
            document.getElementById("welcomeMessage").innerHTML = "<span style='color: tomato;'>Error loading test!</span>";
            document.getElementById("descriptionDisplay").innerHTML = err;
            document.getElementById("finishButton").style.visibility = "hidden";
            console.error(err);
        });
}

onlineStart();