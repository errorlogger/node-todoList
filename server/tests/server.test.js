const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 0
}];


beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos);
    })
        .then((val, toto) => {
            done();
        })
        .catch((err) => {
            console.log('ERREUR PROMESSE', err)
        });

});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text: text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text: text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        let hexId = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {

    it('doit retourner une tache effacée', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toEqual(todo[0].text)
            })
            .expect((res) => {
                expect(res.body.todo._id).toEqual(todos[0]._id.toHexString())
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(todos[0]._id.toHexString()).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((err) => { done(err) })
            })
    })

    it('doit retourner id invalide', (done) => {
        request(app)
            .delete(`/todos/123aze`)
            .expect(404)
            .expect(res.body).toEqual('id non valide')
            .end(done)
    })

    it('doit retourner id non trouvée', (done) => {
        let hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .expect(res.body).toEqual('id non-trouvée')
            .end(done)
    })
})

describe("PATCH /todos/:id", () => {

    it("should update todo", (done) => {
        let id = todos[0]._id.toHexString();
        let text = 'nouvel intitulé pour cette tache';

        request(app)
            .patch(`/todos/${id}`)
            .send({
                text: text,
                completed: true
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toEqual(text);
                expect(res.body.todo.completed).toEqual(true);
                expect(res.body.todo.completedAt).toBeA('number')
            })
            .end(done)
    });

    it("should update completedAt to 0 if completed is false", (done) => {
        let id = todos[1]._id.toHexString();
        let text = 'nouvel intitulé pour la deuxième tache';

        request(app)
            .patch(`/todos/${id}`)
            .send({
                text: text,
                completed: false
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toEqual(text);
                expect(res.body.todo.completed).toEqual(false);
                expect(res.body.todo.completedAt).toEqual(0)
            })
            .end(done)
    })
})
