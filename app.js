// Setup
const express = require('express');
const dotenv = require('dotenv');
const {google} = require('googleapis');
const fs = require('fs');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

dotenv.config();
const PORT = process.env.PORT;
const submitFormId = process.env.submitFormId;
const submitSheetId = process.env.submitSheetId;
const answerFormId = process.env.answerFormId;
const answerSheetId = process.env.answerSheetId;
const client_email = process.env.client_email;
const private_key = process.env.private_key;


// Authorization setup
const formAuth = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/forms.body'] // Add the required scopes here
);

const forms = google.forms({
    version:'v1',
    auth: formAuth
});

// Authorization
const sheetAuth = new JWT({
    email: client_email,
    key: private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    subject: client_email
})

const submitSheetDoc = new GoogleSpreadsheet(submitSheetId, sheetAuth);
const answerSheetDoc = new GoogleSpreadsheet(answerSheetId, sheetAuth);





const authorQuestions = {
    "Roman": [
        "Lieber die ersten 99% von einem Blowjob oder die letzten 1% übernehmen?",
        "Lieber wissen wie man stirbt oder wann man stirbt?",
        "Man ist für 30 Tage in einem Raum mit einem Bett, Badezimmer, Computer mit Internet, unendlich Essensvorräte und nicht alkoholische Getränke eingesperrt. Man hat folgende 4 Optionen die man mitnehmen kann:",
        "Lieber 10 5-Jährige oder 5 10-Jährige fighten müssen?",
        "Lieber 1 Millionen Dollar in Roulette setzen oder einfach so 300.000 Euro bekommen?",
        "Du siehst 4 verschieden Leute etwas in einem Supermarkt stehlen und du musst einen reporten. Wen würdest du am ehesten reporten:",
        "Lieber permanent einen Steifen oder permanent soft sein (Falls Frau dann das Äquivalent dazu)?",
        "Lieber jemanden umbringen und keiner wird jemals herausfinden dass du jemanden umgebracht hast oder keinen umbringen aber jeder denkt dass du jemanden umgebracht hast?",
        "Frankreich oder England auslöschen?"
    ],
    "Paul": [
        "Darf man Minecraft Betten zusammenstellen, wenn man nicht zusammen ist?",
        "Tee oder Kaffee?",
        "Lieblingsjahreszeit?",
        "Englisch oder Spanisch?",
        "Eher einen Eimer Zahnpasta oder einen Eimer Mehl essen?",
        "Lieber ein drittklassiger Duellant sein, oder ein viertklassiges Deck haben?",
        "Was würde in einem Kampf gewinnen, eine Milliarden Löwen, oder alle Pokémon?"
    ],
    "Maxi": [
        "Was würdet ihr eher: jeden Tag einen Löffel Sand essen oder jedes Mal beim Scheißen jemandem Random auf der Welt Demenz geben?",
        "Man ist in seiner Mutter drin, aber sein Dad ist in dir drin, würdest du eher vorbumsen um rauszukommen oder nach hinten?",
        "Lieber heftig brennenden Durchfall oder Kotzen?",
        "Du bist im Club, nachdem du deinen Job verloren hast und dein Partner Schluss gemacht hat, und gehst aufs Klo, ein Typ spricht dich an und bietet dir was von seinem Arsenal an, dabei hat er das übliche, Dope, Coke, Molly, aber etwas anderes springt dir ins Auge, es ist klein und blau, \"Schlumpf\" nennt er das, und bietet es umsonst an, du weißt nicht was es ist, aber es schaut appetitlicher aus als ein Tide Pod, nimmst du es, oder gehst du weiter dein beschissenes Leben im Club weiterfeiern?",
        "Talahon Sohn oder OnlyFans Tochter?",
        "Hast du jemanden fast umgebracht?",
        "Würdest du wen aus der runde knallen (Pärchen not included)?"
    ],
    "Kassi": [
        "Deine Reaktion wenn du eine Katze siehst?"
    ],
    "Domi": [
        "Lieber Franzose oder Engländer sein?",
        "Lieber blind oder ein Zwerg sein?",
        "Lieber Jabba the Hutt nach einer Dusche bangen oder Prinzessin Leia 6 Stunden lang schon ne Leiche?",
        "Lieber obdachlos sein, aber du hast ne 10% Chance ein normales Leben zu bekommen oder Hitler sein 2 Jahre bevor er stirbt?",
        "Lieber 3x 15-Jährige oder 1x 3-Jährige?",
        "Wer ist stärker?",
        "Sink in the cum oder cum in the sink?",
        "Lieber selber transgender werden oder jede Trans-Person immer Faggot nennen, also immer wenn du eine siehst musst du es der Person nachrufen?",
        "Lieber nie wieder an PC, Laptop gehen oder nie wieder an Mobile Geräte (Handy, Tablet, etc.) gehen?",
        "Lieber 2000€ oder Mystery Box"
    ],
    "Nico": [
        "Bestes Element?",
        "Ganz One Piece am Stück schauen oder LoL am Stück spielen bis man höchsten Rang hat?",
        "Trägst du gerade Socken?",
        "iCarly oder Big Time Rush?",
        "Coolstes Element im Periodensystem?",
        "Wie oft wischst du nach dem Scheißen?"
    ]
}



const testQ1 = "Links oder Rechts?";
const testQ2 = "Schere, Stein, Papier?";
const testQ3 = "abcd?";
const testQ4 = "animol?";
const testQ5 = "TestTestTest?";
const testQ6 = "OptionenOptionenOptionenOptionen OptionenOptionenOptionenOptionen OptionenOptionenOptionenOptionen OptionenOptionenOptionenOptionen OptionenOptionenOptionenOptionen OptionenOptionenOptionenOptionen  OptionenOptionenOptionenOptionen?";

const questionToQuery = testQ6;

const questions = [ testQ1, testQ2, testQ3, testQ4, testQ5, testQ6];




// App setup
const app = express();
app.set("views", "viewsDir");
app.set("view engine", "pug");
//turn on serving static files (required for delivering css to client)
app.use(express.static("public"));
app.listen(PORT, () => console.log(`Server listening on Port ${PORT}`));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let visitedQuestions = [];

app.get("/", async (req,res) => {
    let result = {};
    
    let diffArr = {};
    diffArr.Easy = [];
    diffArr.Mid = [];
    diffArr.Hard = [];
    diffArr["Good luck"] = [];

    await GetFormQuestionsWithSpecificOptionsAmount(2).then(twoOptionQuestions => 
        SplitTwoOptionQuestionsIntoDifficulties(twoOptionQuestions, diffArr)  
    );

    await GetFormQuestionsWithSpecificOptionsAmount(3).then(threeOptionQuestions => 
        SplitThreeOptionQuestionsIntoDifficulties(threeOptionQuestions, diffArr)  
    );

    await GetFormQuestionsWithSpecificOptionsAmount(4).then(fourOptionQuestions => 
        SplitFourOptionQuestionsIntoDifficulties(fourOptionQuestions, diffArr)  
    );

    for(const [key, value] of Object.entries(diffArr)) {
        diffArr[key] = [];
        value.forEach(question => {
            let questionObj = {};
            questionObj.questionTitleNormal = question;
            questionObj.questionTitleURL = GetByURLUsableQuestionTitle(question);
            questionObj.questionEndsWithQuestionMark = question[question.length-1] === "?";
            diffArr[key].push(questionObj);
        });
    }

    result.optionDifficultySplit = diffArr
    
    console.log(diffArr.Hard);
    console.log("vT: " + visitedQuestions);

    result.visitedQuestions = visitedQuestions;
    result.difficulties = ['Easy', 'Mid', 'Hard', 'Good luck'];
    console.log(result);
    res.render("selectQuestion", {result});
});


app.get("/questionSite/:questionTitle/:questionEndsWithQuestionMark", async (req,res) => {
    let questionTitle = req.params.questionTitle;
    let questionEndsWithQuestionMark = req.params.questionEndsWithQuestionMark;

    questionTitle = ParseBackFromURL( req.params.questionTitle );

    if(questionEndsWithQuestionMark.toLowerCase() === "true")
        questionTitle = questionTitle + "?";
    // if(!/[.:!]/.test( questionTitle.charAt(questionTitle.length-1) ))
    //     questionTitle = questionTitle + "?";    // Add ? cause ? is at end of url and doesn't get recognised when parsed (? is for parameters)
    visitedQuestions.push(questionTitle);


    let optionAmount;
    for(const row of cachedSubmitRows) {
        if(row.get("Frage") === questionTitle) {
            optionAmount = row.get("Anzahl Optionen");
        }
    }

    let result = {};
    await GetNameDistribution(questionTitle, optionAmount, true).then( nameDistribution => {
        RemoveOptionsNoOneAnswered(nameDistribution);
        result.nameDistribution = nameDistribution;
        result.question = questionTitle;

        result.author = GetQuestionAuthor(questionTitle);
            
        console.log({result});

        res.render("displayQuestionStats", {result});
    });
});


process.on("SIGINT", async () => {
    for(const row of cachedSubmitRows) {
        if(visitedQuestions.includes( row.get("Frage") )) {
            console.log(`Saving ${row.get("Frage")} finished`);
            row.set("hasBeenUsedInGame", "TRUE");
            await row.save();
        }
    }
    console.log("All visited questions marked in database. Terminal and tab can be closed");
    process.exit(0);
});


// Just for debugging
// GetNameDistribution(questionToQuery).then(result => console.log(result));
// GetTwoOptionFormQuestions(realFormId).then(result => console.log(result));

// GetTwoOptionQuestionAnswerDifference(questionToQuery).then(result => {
//     const difficulty = GetTwoOptionQuestionDifficulty(result);
//     console.log(difficulty);
// });

// SplitTwoOptionQuestionsIntoDifficulties(questions).then(q => console.log(q));



let cachedForm, formCachingIsDone = false;
(async function CacheAnswerForm(formId) {
    try {
        await formAuth.authorize();
        const form = await forms.forms.get({
            formId: formId
        });
        cachedForm = form;
        formCachingIsDone = true;
        console.log("Form caching done")
    }
    catch(error) { console.error("Error:", error); }
})(answerFormId)


let cachedSubmitRows, submitRowCachingIsDone = false;
(async function CacheAnswerSheetRows() {
    await submitSheetDoc.loadInfo();
    const sheet = submitSheetDoc.sheetsByIndex[0];
    cachedSubmitRows = await sheet.getRows();
    submitRowCachingIsDone = true;
    console.log("SubmitSheet caching done")
})()


let cachedAnswerRows, answerRowCachingIsDone = false;
(async function CacheAnswerSheetRows() {
    await answerSheetDoc.loadInfo();
    const sheet = answerSheetDoc.sheetsByIndex[0];
    cachedAnswerRows = await sheet.getRows();
    answerRowCachingIsDone = true;
    console.log("AnswerSheet caching done")
})()


const checkAllReadyIntervalId = setInterval(checkAllReady, 500);
function checkAllReady() {
    if(formCachingIsDone && submitRowCachingIsDone && answerRowCachingIsDone) {
        clearInterval(checkAllReadyIntervalId);
        console.log("All caching done. Site can be started");
    }
}


async function GetQuestionOptions(question, optionAmount) {
    // Returns options into object array
    let questionOptions = [];

    for(const submitSheetQuestion of cachedSubmitRows) {

        if(submitSheetQuestion.get("Frage") === question) {
            if(optionAmount >= 2) {
                questionOptions.push( submitSheetQuestion.get("1. Option") );
                questionOptions.push( submitSheetQuestion.get("2. Option") );
            }
            if(optionAmount >= 3) {
                questionOptions.push( submitSheetQuestion.get("3. Option") );
            }
            if(optionAmount == 4) {
                questionOptions.push( submitSheetQuestion.get("4. Option") );
            }
        }
    }

    return questionOptions;
}

async function GetNameDistribution(question, optionAmount, includeEmptyFields) {
    let nameDistribution = {};
    const options = await GetQuestionOptions(question, optionAmount);
    options.sort();

    if(includeEmptyFields) {
        for(const row of cachedAnswerRows) {
            if(row.get(question) === undefined) {
                nameDistribution["!"] = {};   
            }
        }
    }

    for(const option of options) {
        console.log("option: " + option);
        nameDistribution[option] = [];
        for(const row of cachedAnswerRows) {
            if(row.get(question) === option) {
                const name = row.get("Name");
                console.log("name: " + name);
                nameDistribution[option].push(name);
            }
        }
    }

    return nameDistribution;
}


function RemoveOptionsNoOneAnswered(nameDistribution) {
    for(const key in nameDistribution) {
        if(nameDistribution[key].length === 0) {
            delete nameDistribution[key];
        }
    }
}


async function GetFormQuestionsWithSpecificOptionsAmount(optionAmount)
{
    let optionFormQuestions = [];

    for(const row of cachedSubmitRows) {
        const optionCount = row.get("Anzahl Optionen");
        const hasBeenUsedInPoll = String(row.get("hasBeenUsedInPoll")).toLowerCase() === "true";
        const hasBeenUsedInGame = String(row.get("hasBeenUsedInGame")).toLowerCase() === "true";

        if(optionCount == optionAmount && hasBeenUsedInPoll && !hasBeenUsedInGame) {
            const questionTitle = row.get("Frage");
            optionFormQuestions.push(questionTitle);
        }
    }
    
    return optionFormQuestions;
}



async function SplitTwoOptionQuestionsIntoDifficulties(questions, diffArr) {
    for(let question of questions) {
        const difference = await GetTwoOptionQuestionAnswerDifference(question);
        const difficulty = GetTwoOptionQuestionDifficulty(difference);
        diffArr[difficulty].push((question));
    }
}

async function SplitThreeOptionQuestionsIntoDifficulties(questions, diffArr) {
    for(let question of questions) {
        const difficulty = await GetThreeOptionQuestionDifficulty(question);
        diffArr[difficulty].push((question));
    }
}

async function SplitFourOptionQuestionsIntoDifficulties(questions, diffArr) {
    for(let question of questions) {
        const difficulty = await GetFourOptionQuestionDifficulty(question);
        diffArr[difficulty].push((question));
    }
}



function GetQuestionAuthor(question) {
    for(const submitQuestion of cachedSubmitRows) {
        if(submitQuestion.get("Frage") === question) {
            return submitQuestion.get("Fragensteller");
        }
    }
}



function GetByURLUsableQuestionTitle(questionTitle) {
    const questionEndsInQuestionMark = questionTitle[questionTitle.length-1] === "?";
    if(questionEndsInQuestionMark)
        questionTitle = questionTitle.slice(0,-1);
    let questionTitleUsableByURL = questionTitle.replace(/\//g, "dbgSlash")
                                                .replace(/#/g, "dbgHashtag")
                                                .replace(/\?/g, "dbgQuestionMark")
    // if(questionEndsInQuestionMark)
    //     questionTitleUsableByURL = questionTitleUsableByURL.concat("?");

    return questionTitleUsableByURL;
}


function ParseBackFromURL(urlQuestion) {
    return urlQuestion.replace(/dbgSlash/g, "/")
                    .replace(/dbgHashtag/g, "#")
                    .replace(/dbgQuestionMark/g, "?");
}



async function GetTwoOptionQuestionAnswerDifference(question) {
    const nameDistribution = await GetNameDistribution(question, 2);

    const firstKey = Object.keys(nameDistribution)[0];
    const secondKey = Object.keys(nameDistribution)[1];

    const optionAAmount = nameDistribution[firstKey].length;
    const optionBAmount = nameDistribution[secondKey].length;

    const difference = Math.abs(optionAAmount - optionBAmount);
    return difference;
}

// Nico, Paul, Domi, Roman, Maxi, Marcel, Lucie, Jan, Kassi

function GetTwoOptionQuestionDifficulty(difference) {
    if(difference < 1)
        return "Easy";
    else if(difference <= 3)
        return "Mid";
    else if(difference <= 5)
        return "Hard";
    else
        return "Good luck";
}

// 4/5 5/4  diff: 1     4/4     diff: 0     Easy
// 3/6 6/3  diff: 3     3/5 5/3 diff: 2     Mid
// 2/7 7/2  diff: 5     2/6 6/2 diff: 4     Hard
// 1/8 8/1  diff: 7     1/7 7/1 diff: 6     Good luck
// 0/9 9/0  diff: 9     0/8 8/0 diff: 8     Good luck

async function GetThreeOptionQuestionDifficulty(question) {
    const nameDistribution = await GetNameDistribution(question, 3);

    for(const names of Object.values(nameDistribution)) {
        if(names.length == 1)
            return "Good luck";
    }
    return "Hard";
}

// 2/3/3               Hard 
// 1/4/3 1/2/5 1/1/6   Good luck

async function GetFourOptionQuestionDifficulty(question) {
    const nameDistribution = await GetNameDistribution(question, 4);

    for(const names of Object.values(nameDistribution)) {
        if(names.length == 1)
            return "Good luck";
    }
    return "Hard";
}

// 2/?/?/?  Hard
// 1/?/?/?  Good luck