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


app.get('/todos/:id', (req, res) => {
    let id = req.params.id;

    if (ObjectId.isValid(id)) {
        Todo.findById(id).then((todo) => {
            if (todo) {
                res.send(todo);
            } else {
                res.status(404).send("aucun élément")
            }
        }).catch((err) => {
            res.status(400).send({})
        })
    } else {
        res.status(404).send("id incorrecte")
    }
})


app.post("/todos", (req, res) => {
    let dataTodo = req.body
    let newTodo = new Todo(dataTodo);
    newTodo.save().then((doc) => {
        console.log('voici la nouvelle tache : ', doc);
        res.send("ok nouvelle tache enregistrée")

    }).catch((err) => {
        console.log('il y a eu une erreur : ', err)
        res.status(400).send(err.message)
    })

})
app.listen(3000, () => {
    console.log("server sur port 3000")
})

module.exports = { app };