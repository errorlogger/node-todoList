const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');


let { mongoose } = require('./database/mongoose');
let { User } = require('./models/user');
let { Todo } = require('./models/todo');


var app = express();

//MIDDLEWARES

app.use(bodyParser.json());


//ROUTES

app.get("/", (req, res) => {
    res.send("<h1>BIENVENU SUR L'APPLI !</h1>")
})
app.post("/todos", (req, res) => {
    let dataUser = req.body
    let newTodo = new Todo(dataUser);
    newTodo.save().then((doc) => {
        console.log('voici la nouvelle tache : ', doc);

    }).catch((err) => {
        console.log('il y a eu une erreur : ', err)
        res.status(400).send(err.message)
    })

})
app.listen(3000, () => {
    console.log("server sur port 3000")
})

module.exports = { app };