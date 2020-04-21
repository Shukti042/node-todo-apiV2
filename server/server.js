require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');


var app = express();

var port = process.env.PORT;

app.use(bodyParser.json());

//resource creation
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
        //res.send diye localhost:3000/todos ei page a data pathai,
        //mane page ta on korle ki dekha jabe sheta
    }, (e) => {
        res.status(400).send(e);
    })
})

//sign up
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']); //user ei duitai pathate parbe
    var user = new User(body); //uporer body object tai return korbo

    //console.log(user);

    user.save().then(() => {
            return user.generateAuthToken();
        })
        .then((token) => {
            res.header('x-auth', token).send(user);
        })
        .catch((e) => {
            res.status(400).send(e);
        })
})

//log in
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    //res.send(body);

    User.findByCredentials(body.email, body.password).then((user) => {
        //res.send(user);
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => {
        res.status(400).send();
    })
})

//log out

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    })
})

//read todos
app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then((todos) => {
        //res.send(todos);
        res.send({ todos });
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    //res.send(req.params);
    //validate id
    //not valid? stop function execution and respond with 404
    //send back with empty body

    //findbyid
    //success
    //if(todo)-send back
    //no todo - send back 404 with an empty body
    //error-send 400-empty body
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send()
        }
        res.send({ todo });
    }).catch((e) => {
        res.status(400).send();
    });


});
//update todos

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, { $set: body }, { $new: true })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send()
            }
            res.send({ todo });
        }).catch((e) => {
            res.status(400).send();
        })
})

//delete todos
app.delete('/todos/:id', authenticate, (req, res) => {
    //get the id
    var id = req.params.id;

    //validate the id >  not valid ? return 404
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    //remove by id
    //success
    Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        }).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        }).catch((e) => {
            res.status(400).send();
        })
        //if no doc -> send 404
        //if doc -> send doc with 200
        //error
        //400-> empty body

})


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
})

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});




module.exports = { app };