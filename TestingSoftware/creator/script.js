const categorySelect = document.getElementById("categorySelect");
var categories = [];
var dataList = "";

class category {
    constructor(name) {
        this.name = name;
        this.questions = [];
        this.flippedQuestions = [];
        categories.push(this);
    }

    addQuestion(questionVar, worth) {
        this.questions.push(new question(questionVar, worth));
        this.flippedQuestions.push(new question(questionVar.replace("I ", "They ").replace("myself", "themself").replace("my", "their"), worth));
    }
}
class question {
    constructor(question, worth) {
        this.question = question;
        this.worth = worth;
    }
}

function print(text) {
    document.getElementById("output").innerHTML += "<br>" + text;
}

function createCategory() {
    new category(prompt("What is the category name?"));
    update();
}

function createQuestion() {
    let found = false;
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].name == document.getElementById("categorySelect").value) {
            categories[i].addQuestion(
                document.getElementById("questionInput").value,
                document.getElementById("worthSelect").value
            );
            found = true;
            break;
        }
    }
    document.getElementById("questionInput").value = "";
    if (!found)
        print("<span style='color: red;'>Error: Category '" + document.getElementById("categorySelect").value + "' not found!</span>");
    togglePopup("createQuestion");
    update();
}

function printAllData() {
    document.getElementById("output").innerHTML = "";
    for (let i = 0; i < categories.length; i++) {
        print("<span style='font-weight: bold; color: cyan;'>" + categories[i].name + ":" + "</span>");
        for (let j = 0; j < categories[i].questions.length; j++)
            print(categories[i].questions[j].question + " (" + categories[i].questions[j].worth + ")");
        print("<br>");
    }
}

function togglePopup(popupId) {
    if (document.getElementById(popupId).style.visibility == "hidden")
        document.getElementById(popupId).style.visibility = "unset";
    else
        document.getElementById(popupId).style.visibility = "hidden";
}

function save() {
    dataList.categories = [];
    let index = 1;
    for (let i = 0; i < categories.length; i++) {
        let questions = [];
        for (let j = 0; j < categories[i].questions.length; j++) {
            questions.push({
                "index": index,
                "question": categories[i].questions[j].question,
                "flipped": categories[i].flippedQuestions[j].question,
                "worth": categories[i].questions[j].worth,
                "answer": "none"
            });
            index++;
        }
        dataList.categories.push({
            "name": categories[i].name,
            "questions": questions,
            "score": 0
        });
    }
    data = JSON.stringify(dataList);
    downloadToFile(data, "PhalanxTest.json", "text/plain")
}
const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

document.getElementById("loadFile").addEventListener("change", function (e) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(e.target.files[0]);
});
function onReaderLoad(event) {
    try {
        var obj = JSON.parse(event.target.result);
        dataList = obj;
        loadTest();
    }
    catch {
        alert("ERROR: The file you have uploaded is not a Phalanx Test!");
    }
}

function loadTest() {
    categories = [];
    for (let i = 0; i < dataList.categories.length; i++) {
        new category(dataList.categories[i].name);
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            categories[i].addQuestion(dataList.categories[i].questions[j].question, dataList.categories[i].questions[j].worth);
        }
    }
    update();
}

function remove() {
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].name == document.getElementById("deleteCategorySelect").value) {
            if (document.getElementById("deleteOption").value == "category") {
                categories.splice(i, 1);
                update();
                return;
            }
            else {
                for (let j = 0; j < categories[i].questions.length; j++) {
                    if (document.getElementById("deleteQuestionSelect").value == categories[i].questions[j].question) {
                        categories[i].questions.splice(j, 1);
                        update();
                        return;
                    }
                }
            }
        }
    }
}

function update() {
    categorySelect.innerHTML = "";
    document.getElementById("deleteCategorySelect").innerHTML = "";
    document.getElementById("deleteQuestionSelect").innerHTML = "";
    for (let i = 0; i < categories.length; i++) {
        categorySelect.innerHTML += "<option value='" + categories[i].name + "'>" + categories[i].name + "<option>";
        document.getElementById("deleteCategorySelect").innerHTML += "<option value='" + categories[i].name + "'>" + categories[i].name + "<option>";
    }

    if (document.getElementById("deleteOption").value == "category")
        document.getElementById("deleteQuestionSelect").style.opacity = "20%";
    else {
        document.getElementById("deleteQuestionSelect").style.opacity = "100%";
    }

    for (let i = 0; i < categories.length; i++) {
        if (categories[i].name == document.getElementById("deleteCategorySelect").value) {
            for (let j = 0; j < categories[i].questions.length; j++) {
                document.getElementById("deleteQuestionSelect").innerHTML += "<option value='" + categories[i].questions[j].question + "'>" + categories[i].questions[j].question + "<option>";
            }
            break;
        }
    }

    printAllData();
}

let updaters = document.getElementsByClassName("updater");
for (let i = 0; i < updaters.length; i++)
    updaters[i].addEventListener("change", function (e) { update() });
document.getElementById("deleteCategorySelect").addEventListener("change", function (e) {
    document.getElementById("deleteQuestionSelect").innerHTML = "";
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].name == document.getElementById("deleteCategorySelect").value) {
            for (let j = 0; j < categories[i].questions.length; j++) {
                document.getElementById("deleteQuestionSelect").innerHTML += "<option value='" + categories[i].questions[j].question + "'>" + categories[i].questions[j].question + "<option>";
            }
            break;
        }
    }
});

function applyTestSettings() {
    let testNameInput = document.getElementById("testNameInput");
    let testDescriptionInput = document.getElementById("testDescriptionInput");
    let perspectiveInput = document.getElementById("perspectiveSelect");
    dataList.testName = testNameInput.value;
    dataList.testDescription = testDescriptionInput.value;
    dataList.perspective = perspectiveInput.value;
}

function onlineStart() { //For if the site is on a server (or VSCode Live Server)
    fetch('../tests/template.json')
        .then(response => response.text())
        .then(data => {
            dataList = JSON.parse(data);
            /*let test = new category("Test Category");
            test.addQuestion("Is this working?", "+");
            test.addQuestion("I hope it is", "-");
            let test2 = new category("Another Test Category");
            test2.addQuestion("Maybe it is?", "+");
            test2.addQuestion("I am not sure", "-");*/
            update();
        })
        .catch(err => {
            //console.clear();
            console.error("Error: Cannot Access Online Template");
            alert("NOTICE: Phalanx Test Creator is meant to be run on an online website. It will now run in offline mode")
            offlineStart();
        });
}

onlineStart();