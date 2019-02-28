require('./config')
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const _ = require('lodash')

let { mongoose } = require('./database/mongoose');
let { User } = require('./models/user');
let { Todo } = require('./models/todo');
let { authToken } = require('./middlewares/authToken');


var app = express();
//heroku port
const port = process.env.PORT;

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
        Todo.findOne({ _id: id }).then((todo) => {
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

    Todo.insertMany([newTodo])
    /*newTodo.insertOne()*/.then((todo) => {

            res.send({ todo })

        }).catch((err) => {
            console.log('il y a eu une erreur : ', err)
            res.status(400).send(err.message)
        })

})

app.delete('/todos/:id', ((req, res) => {
    let id = req.params.id;

    if (ObjectId.isValid(id)) {
        Todo.findOneAndDelete({ _id: id }).then((todo) => {
            if (todo) {
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

app.patch("/todos/:id", (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (ObjectId.isValid(id)) {
        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime();
        } else {
            body.completed = false;
            body.completedAt = 0;
        }

        Todo.findOneAndUpdate({ _id: id }, { $set: body }, { new: true }).then((todo) => {

            if (!todo) {
                res.status(404).send(`la tache ayant l'id ${id} n'existe pas`)
            } else {
                res.send({ todo });
            }

        }).catch((err) => {
            res.status(400).send('une erreur s\'est produite');
        })


    } else {
        res.status(404).send("id incorrecte")
    }
})

app.post('/users', (req, res) => {
    let newUserCredentials = _.pick(req.body, ['email', 'password', 'firstName', 'lastName'])
    let newUser = new User(newUserCredentials);

    User.insertMany([newUser])
        .then(() => {
            return newUser.generateAuthToken();
        })
        .then((token) => {
            res.header('x-auth', token).send(newUser);
        })
        .catch((err) => {
            console.error(err.message)
            res.status(400).send(err)
        })
})

app.get('/users/me', authToken, (req, res) => {
    res.send(req.user)
})

app.listen(port, () => {
    console.log("server sur port : ", port)
})

module.exports = { app };