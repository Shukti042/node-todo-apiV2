var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
console.log('--------MongoDB URI---------');
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }).
catch((e) => {
    res.status(400).send(e);
});

// const conn = mongoose.connection;
// mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
// mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); });

module.exports = { mongoose };
