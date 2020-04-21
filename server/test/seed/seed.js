const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

const user1ID = new ObjectID();
const user2ID = new ObjectID();

const users = [{
    _id: user1ID,
    email: 'anisha@islam.com',
    password: 'passwordForAnisha',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: user1ID, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: user2ID,
    email: 'anishaghumai@islam.com',
    password: 'passwordForNafisa',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: user2ID, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
}]

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: user1ID
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: user2ID
}];

const populateTodos = (done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos);

    }).then(() => done());
}

const populateUsers = (done) => {
    User.deleteMany({}).then(() => {
        var user1 = new User(users[0]).save();
        var user2 = new User(users[1]).save();

        return Promise.all([user1, user2])
    }).then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };