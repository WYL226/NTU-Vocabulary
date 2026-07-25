console.log("Version 2");
//==============================
// Google Apps Script API
//==============================

const BASE_API_URL =
"https://script.google.com/macros/s/AKfycbyeXobMFQRIVpFAWqullZAhVCEcpc_kSttb9hTgzmYkWsqeddRxycF5Ox0Qf0uAhP43/exec";

//==============================
// 取得網址 sheet 參數
//==============================

const params =
    new URLSearchParams(window.location.search);

const sheetName =
    params.get("sheet");

//==============================
// 最終 API
//==============================

const API_URL =
    sheetName

    ?

    `${BASE_API_URL}?sheet=${encodeURIComponent(sheetName)}`

    :

    BASE_API_URL;

console.log("目前工作表：", sheetName || "綾");
console.log("API：", API_URL);

//==============================
// 全域變數
//==============================

let words = [];

let shuffledWords = [];

let currentIndex = 0;

//==============================
// 目前題目
//==============================

let currentQuestion = null;

let answerVisible = false;

let history = [];

let historyIndex = -1;

//==============================
// Fisher-Yates 洗牌
//==============================

function shuffle(array){

    let arr = [...array];

    for(let i = arr.length - 1; i > 0; i--){

        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];

    }

    return arr;

}

//==============================
// 權重抽題
//==============================

function weightedChoice(){

    let totalWeight = 0;

    for(const word of words){

        totalWeight += word.weight;

    }

    const randomWeight =
        Math.random() * totalWeight;

    let currentWeight = 0;

    for(const word of words){

        currentWeight += word.weight;

        if(currentWeight >= randomWeight){

            return word;

        }

    }

    return words[0];

}

//==============================
// 顯示題目
//==============================

function showWord(){
    console.log(
    document.getElementById("progress")
);

answerVisible = false;

    document
    .getElementById("answerArea")
    .innerHTML = "";

    document
    .getElementById("answerButton")
    .innerHTML =
    "👁 顯示答案";

    document
    .getElementById("progress")
    .innerHTML =

    `第 ${historyIndex + 1} / ${history.length} 題`;

    const word =
        currentQuestion.word;

    const mode =
        currentQuestion.mode;

    if(mode==="EN_TO_ZH"){

        document
            .getElementById("questionType")
            .innerHTML =
            "英文 ➜ 中文";

        document
            .getElementById("question")
            .innerHTML =
            word.en;

    }

    else{

        document
            .getElementById("questionType")
            .innerHTML =
            "中文 ➜ 英文";

        document
            .getElementById("question")
            .innerHTML =
            word.zh;

    }

    document
        .getElementById("errorMessage")
        .innerHTML = "";

}

//==============================
// 顯示 / 隱藏答案
//==============================

function toggleAnswer(){

    const input =
        document.getElementById("answerInput");

    const word =
        currentQuestion.word;

    const mode =
        currentQuestion.mode;

    const answer =

        mode==="EN_TO_ZH"

        ?

        word.zh

        :

        word.en;

    if(!answerVisible){

        document
        .getElementById("answerArea")
        .innerHTML =
        answer;

        document
        .getElementById("answerButton")
        .innerHTML =
        "🙈 隱藏答案";

        answerVisible = true;

    }

    else{

        document
        .getElementById("answerArea")
        .innerHTML = "";

        document
        .getElementById("answerButton")
        .innerHTML =
        "👁 顯示答案";

        answerVisible = false;

    }

    // 重新取得焦點
    requestAnimationFrame(() => {

        input.focus({
            preventScroll:true
        });

        // 將游標移到文字最後
        const len = input.value.length;
        input.setSelectionRange(len, len);

    });

}

//==============================
// 判斷答案
//==============================

function isCorrect(userInput){
    
    const word =
        currentQuestion.word;

    const mode =
        currentQuestion.mode;

    // 去掉前後空白
    userInput =
        userInput.trim();

    //==========================
    // 英文 → 中文
    //==========================

    if(mode==="EN_TO_ZH"){

        const answers =
            word.zh
            .replace(/,/g,"/")
            .split("/")
            .map(a=>a.trim());

        return answers.includes(userInput);

    }

    //==========================
    // 中文 → 英文
    //==========================

    else{

        return userInput===word.en;

    }

}

//==============================
// 送出答案
//==============================


function submitAnswer(){

    const input =
        document.getElementById("answerInput");

    const result =
        isCorrect(input.value);

    // 偵錯用
    console.log("是否答對：", result);
    console.log("目前單字：", currentQuestion.word.en);
    console.log("目前權重：", currentQuestion.word.weight);

    if(result){

        // 答對恢復權重
        currentQuestion.word.weight = 1;

        nextWord();

    }

    else{

        // 答錯增加權重
        currentQuestion.word.weight++;

        document
            .getElementById("errorMessage")
            .innerHTML = "錯誤";

       // console.log(
       //     "新的權重：",
         //   currentQuestion.word.weight
        //);

        // ===== 新增：清空輸入框 =====
        input.value = "";

        // ===== 新增：游標保持在輸入框 =====
        input.focus();

    }

}


//==============================
// 下一題
//==============================

function nextWord(){

    //==========================
    // 如果 history 還有下一題
    //==========================

    if(historyIndex < history.length - 1){

        historyIndex++;

        currentQuestion = history[historyIndex];

    }

    //==========================
    // 已經最新題
    //==========================

    else{

        currentQuestion = {

            word: weightedChoice(),

            mode:

                Math.random()<0.5 ?

                "EN_TO_ZH"

                :

                "ZH_TO_EN"

        };

        history.push(currentQuestion);

        historyIndex = history.length - 1;

    }

    showWord();

    const input =
        document.getElementById("answerInput");

    input.value = "";

    input.focus();

}

//==============================
// 上一題
//==============================

function prevQuestion(){

    if(historyIndex <= 0){

        return;

    }

    historyIndex--;

    currentQuestion = history[historyIndex];

    showWord();

    const input =
        document.getElementById("answerInput");

    input.value = "";

    input.focus();

}

//==============================
// 下一題（歷史）
//==============================

function nextHistoryQuestion(){

    if(historyIndex >= history.length - 1){

        nextWord();

        return;

    }

    historyIndex++;

    currentQuestion = history[historyIndex];

    showWord();

    const input =
        document.getElementById("answerInput");

    input.value = "";

    input.focus();

}

//==============================
// 載入 Google Sheet
//==============================

async function loadWords(){

    try{

        const response =
            await fetch(API_URL);

        words =
            (await response.json()).map(word => ({

                ...word,

                weight:1

            }));

        currentQuestion = {

             word: weightedChoice(),

            mode:

                Math.random()<0.5 ?

                "EN_TO_ZH"

                :

                "ZH_TO_EN"

};

history.push(currentQuestion);

historyIndex = 0;

        showWord();

        document
        .getElementById("answerInput")
        .focus();

    }

    catch(error){

        console.log(error);

        document
        .getElementById("english")
        .innerHTML = "讀取失敗";

        document
        .getElementById("chinese")
        .innerHTML = "";

    }

}

loadWords();



//==============================
// Enter
//==============================

const input =
document.getElementById("answerInput");

answerInput.addEventListener("keydown", function(event){

    if(event.key==="Enter"){

        submitAnswer();

    }

});

//==============================
// Button
//==============================

document
.getElementById("nextButton")
.addEventListener("click",function(){

    submitAnswer();

});

const answerButton =
    document.getElementById("answerButton");

answerButton.addEventListener("click", function () {

    toggleAnswer();

    const input =
        document.getElementById("answerInput");

    requestAnimationFrame(() => {

        input.focus({ preventScroll: true });

        const len = input.value.length;

        input.setSelectionRange(len, len);

    });

});

//==============================
// 上一題 Button
//==============================

document
.getElementById("prevButton")
.addEventListener("click",function(){

    prevQuestion();

});

//==============================
// 下一題（History）Button
//==============================

document
.getElementById("nextHistoryButton")
.addEventListener("click",function(){

    nextHistoryQuestion();

});