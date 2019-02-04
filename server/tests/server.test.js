const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');


beforeEach((done) => {
    Todo.remove({}).then(() => {
        done();
    });
});


describe('POST /todos', () => {

    it('doit créer une nouvelle task (Todo)', (done) => {
        var task = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text: task })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(task)
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0]).toBe(task);
                    done();
                }).catch((err) => {
                    done(err)
                })
            })
    });

    it('ne doit pas générer de nouveau document', (done) => {

        request('app')
            .post('/todos')
            .send({ text: "ab" })
            .expect(400)
            .end((err, res) => {

                if (err) {

                    return done(err)
                }

                Todo.find({}).then((todos) => {
                    expect(todos.length).toBe(0);
                    done()
                }).catch((err) => {
                    done(err);
                })
            })

    })
})