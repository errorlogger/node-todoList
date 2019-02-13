const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');


let { mongoose } = require('./database/mongoose');
let { User } = require('./models/user');
let { Todo } = require('./models/todo');


var app = express();
//heroku port
const port = process.env.PORT || 3000;

//MIDDLEWARES

app.use(bodyParser.json());


//ROUTES

app.get("/", (req, res) => {
    res.send("<h1>BIENVENU SUR L'APPLI !</h1>")
})

app.get('/todos', (req, res) => {
    Todo.find({}).then((todos) => {

        if (!todos) {
            res.send('aucun élément trouvé !');
        } else {
            res.send({ todos });
        }

    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;

    if (ObjectId.isValid(id)) {
        Todo.findById(id).then((todo) => {
            if (todo) {
                res.send({ todo });
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
    newTodo.save().then((todo) => {

        res.send({ todo })

    }).catch((err) => {
        console.log('il y a eu une erreur : ', err)
        res.status(400).send(err.message)
    })

})

app.delete('/todos/:id', ((req, res) => {
    let id = req.params.id;

    if (ObjectId.isValid(id)) {
        Todo.findByIdAndRemove(id).then((todo) => {
            if (doc) {
                res.send({ todo })
            } else {
                res.status(404).send('id non-trouvée')
            }

        }).catch((err) => {
            res.status(400).send('une erreur s\'est produite')
        })
    } else {
        res.status(404).send('id non valide')
    }
}))
app.listen(port, () => {
    console.log("server sur port : ", port)
})

module.exports = { app };