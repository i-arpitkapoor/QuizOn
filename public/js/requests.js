

const getToken = (theUrl) =>{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    const data = JSON.parse(xmlHttp.responseText)
    console.log(data.token)
    return data.token
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//VARIABLES------------------------------------------------------------------------------------------------------------------------------

var questions = []
var ptr = 0
var url_string = window.location.href
var urll = new URL(url_string);
var category = urll.searchParams.get("category");
var difficulty = urll.searchParams.get("difficulty");
var email = urll.searchParams.get("email");
var name = urll.searchParams.get("username")
console.log(difficulty)
console.log(category);
var points = 0
var sec = 10
var correct_ans
var game_state = 0
let data

// --------------------------------------------------------------------------------------------------------------------------------------





// URLs-------------------------------------------------------------------------------------------------------------------------------
const tokenURL = 'https://opentdb.com/api_token.php?command=request'
const token = getToken(tokenURL)
const url = `https://opentdb.com/api.php?amount=1&token=${token}&category=${category}&difficulty=${difficulty}&type=multiple`
const url2 = `https://opentdb.com/api.php?amount=10&token=${token}&category=${category}&difficulty=${difficulty}&type=multiple`


// --------------------------------------------------------------------------------------------------------------------------------------------














// QUESTION GENERATING FUNCTIONS------------------------------------------------------------------------------------------------------

const getQM = async (game_state) => {
    if(game_state === 0 || ptr === 10){
        const response = await fetch(url2)
        if(response.status === 200){
            data = await response.json()
            console.log(data)
        } else {
            throw new Error('Unable to get questions')
        }
        ptr = 0
    }
    render(data, game_state)
    return;
}

const getQ = async (game_state) => {
    clearInterval(timer)
    const response = await fetch(url)

    if(response.status === 200){
        const data = await response.json()
        console.log(data.results[0].question)
        render(data, game_state)
    } else {
        throw new Error('Unable to get question')
    }
    return
}


// --------------------------------------------------------------------------------------------------------------------------------------------













// MISC FUNCTIONS---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const timer = () => {
    var timer = setInterval(function(){
        // document.querySelector('#time').innerHTML= '00:' + Math.ceil(sec);
        let cur = sec
        if(sec>=15){
            document.querySelector('#timer').innerHTML =  '<div class="progress-bar bg-success" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style="width: ' + cur + '%">' + Math.ceil(sec) + '</div>'
        }
        else document.querySelector('#timer').innerHTML = '<div class="progress-bar bg-danger" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style="width: ' + cur + '%">' + Math.ceil(sec) + '</div>'
        sec = sec-0.01;
        if (sec <= 0) {
            // sendEmail(email, name, questions)

            var xhr = new XMLHttpRequest();
            var data = {
                questions: questions,
                name: name,
                email: email,
                score: points
            }
            xhr.open('POST', '/answers');
            xhr.onload = function(data) {
                console.log('loaded', this.responseText);
            };
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
            console.log(questions)
            clearInterval(timer);
            window.location.replace("/leaderboard")
        }
    }, 10);
}

function shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};


const render = (data, game_state) => {
    clearInterval(timer)
    document.querySelector('#ques').textContent = 'Q.' + data.results[ptr].question

    var question = {
        q: data.results[ptr].question,
        a: data.results[ptr].correct_answer
    }
    questions.push(question)

    let answers = [data.results[ptr].correct_answer, data.results[ptr].incorrect_answers[0], data.results[ptr].incorrect_answers[1],data.results[ptr].incorrect_answers[2]]
    shuffle(answers)
    correct_ans = data.results[ptr].correct_answer

    const ops = document.querySelectorAll('#options button')

    ops.forEach((option) => {
        option.style.backgroundColor = "lightblue";
    })

    ops[0].textContent = answers[0]
    ops[0].value = answers[0]

    ops[1].textContent = answers[1]
    ops[1].value = answers[1]

    ops[2].textContent = answers[2]
    ops[2].value = answers[2]

    ops[3].textContent = answers[3]
    ops[3].value = answers[3]

    if(game_state === 0){
        game_state = 1
        timer()
    }
    ptr = ptr + 1
}



// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------









// BUTTON FUNCTIONS------------------------------------------------------------------------------

async function answerA_clicked() {
    var answerA = document.getElementById("answerA").value;
    checkAnswer(answerA, "answerA")
    await sleep(500)
    getQM()
    // sec = 10
}
  
async function answerB_clicked() {
        var answerB = document.getElementById("answerB").value;
        checkAnswer(answerB, "answerB");
        await sleep(500)
         getQM()
        //  sec = 10
}
async function answerC_clicked() {
    var answerC = document.getElementById("answerC").value;
    checkAnswer(answerC, "answerC");
    await sleep(500)
     getQM()
    // sec = 10
}

async function answerD_clicked() {
    var answerD = document.getElementById("answerD").value;
    checkAnswer(answerD, "answerD");
    await sleep(500)
     getQM()

}


// -----------------------------------------------------------------------------------------------









// ANSWER CHECKER ----------------------------------------------------------------------------------

const checkAnswer = async (answer, id) => {
    if(answer === correct_ans)
    {
        document.getElementById(id).style.backgroundColor = "lightgreen"
        points = points+Math.ceil(sec)
        console.log('correct')
    }
    else{
        document.getElementById(id).style.backgroundColor = "#aa051b"
        console.log('incorrect')
    }
    // await sleep(5000)
    document.querySelector('#points').innerHTML = 'Total Points: ' + points
    
}

// ------------------------------------------------------------------------------------------------------------









// START BUTTON -----------------------------------------------------------------------------------------------------------------------------------

document.querySelector('#sg').addEventListener('click', () => {
    getQM(game_state)
    document.querySelector('#start').innerHTML = '<div id="start"><button id="sg" class="ui disabled button">Started</button></div>'
    // game_state = 1;
})

// ---------------------------------------------------------------------------------------------------------------------------------------------------
