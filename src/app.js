const path = require('path')     // in express to serve up static files like html we need to provide absolute paths. this helps in facilitating such things // path is a core node moudle
const express = require('express')   // express library exports single function and not object
const hbs = require('hbs')
const bodyParser = require('body-parser');
const { sendEmail } = require('../email/account')
const { compare, users} = require('../res/array')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID
const mongoose = require("mongoose")
const passport = require('passport')
const LocalStrategy = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose")
const User = require('../models/user')

// hbs.registerHelper('ifCond', function(v1, v2, options) {
//     if(!v1) {
//       return options.fn(this);
//     }
//     return options.inverse(this);
//   });


const connectionURL = process.env.MONGODB_URL
const databaseName = 'Quiz-On'

mongoose.connect(connectionURL)

let db
let scoreDB //= users
let answer





MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if (error){
        return console.log('Unable to connect to database!')
    }
    console.log('connected to DB correctly')

    db = client.db(databaseName)
})



const app = express()
const port = process.env.PORT// || 3000   // port equal to first value if it exists else its equal to 3000

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./'));
app.use(bodyParser.json());



const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup Handlebars engine and views location
app.set('view engine', 'hbs')   // key value pair we are telling express that we are using hbs (handlebars)
app.set('views', viewsPath)  // to tell express to look for all dynamic hbs files in this location
hbs.registerPartials(partialsPath)

// set up static directory to serve
app.use(express.static(publicDirectoryPath))   // to serve public folder





const getArrayFromDB = async () => {
    scoreDB = await db.collection('scorecard').find().sort({score: -1}).toArray()
    console.log('array in func', scoreDB)
}



app.get('', (req, res) => {
    let user
    if(req.user)
        user = req.user.username
    else user = 'LOGOUT!!'
    console.log(req.user)
    res.render('home', {
        user:user
    })
})


app.get('/game', isLoggedIn, (req, res) => {
    // if(req.query.email ==  undefined){
    //     console.log('Fill the form MAN')
    //     res.render('error')
/*} else*/
    console.log(req.query)
    res.render('game')
    
})



// AUTH ROUTES

app.get('/log', isLoggedOut, function (req, res){
    let user = req.body.username
    res.render('login', {
        user: user
    })
})

app.post('/register', function(req, res){
    req.body.username;
    req.body.password;
    User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err, user){
        if(err){
            console.log(err)
            return res.redirect('/log');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect('/')
        });
    })
})

// LOGIN ROUTES

//middleware first middleware is run before function
app.post('/login', passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/log'
}) ,function(req, res) {
});


app.get("/logout", isLoggedIn, function(req,res){
    req.logOut();
    res.redirect('/')
})










app.get('/quiz', isLoggedIn, (req, res) => {
    res.render('index')
})

app.get('/leaderboard', async (req, res) => {
    await getArrayFromDB()
    users.sort(compare)
    if(scoreDB.length <= 9){
        scoreDB = users
    }
        
    var data = {
        name1: scoreDB[0].name,
        name2: scoreDB[1].name,
        name3: scoreDB[2].name,
        name4: scoreDB[3].name,
        name5: scoreDB[4].name,
        name6: scoreDB[5].name,
        name7: scoreDB[6].name,
        name8: scoreDB[7].name,
        name9: scoreDB[8].name,
        name10: scoreDB[9].name,
        s1: scoreDB[0].score,
        s2: scoreDB[1].score,
        s3: scoreDB[2].score,
        s4: scoreDB[3].score,
        s5: scoreDB[4].score,
        s6: scoreDB[5].score,
        s7: scoreDB[6].score,
        s8: scoreDB[7].score,
        s9: scoreDB[8].score,
        s10: scoreDB[9].score
    }


    res.render('leaderboard', data)
})







app.post ('/answers', async function(req, res){
    console.log(req.user)
    console.log(req.body.name, req.body.email, req.body.questions)
    let user = {
        name: req.user.username,
        score: req.body.score
    }

    // console.log('coming from db', usersDB)


    // MAINTAINING AN ARRAY OF TOP RANKERS WITHOUT DB
    users.push(user)
    users.sort(compare)
    if(users.length > 9){
        users.pop()
    }
    console.log(users)



    // INSERTING THE CURRENT PLAYER TO DB TO DATABASE
    await db.collection('scorecard').insertOne({
            // name: req.body.name,
            name: req.user.username,
            email: req.user.email,
            score: req.body.score
        }, (error, result) => {    // a callback called after insertion
            if(error) {
                return console.log("Unable to add Score to DB")
            }
            console.log(result.ops)  //result ops gives array of all docs inserted
        })
    
    sendEmail(req.user.email, req.user.username, req.body.questions)
});

app.get('/home', (req, res) => {
    res.render('homepage')
})

app.get('/log', (req, res) => {
    res.render('login')
})

app.get('/about', (req, res) => {
    res.render('about')
})


app.get('*', (req, res) => {
    res.render('error')
})


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/log")
}

function isLoggedOut(req, res, next){
    if(req.isUnauthenticated()){
        return next();
    }
    res.redirect('/')
}


app.listen(port, () => {    // the process of starting a server is sync or async. i dont know ask.
    console.log('Server is up on port ' + port)
})