'use strict';

// Load array of notes
// const data = require('./db/notes');

console.log('Hello Noteful!');

// EXPRESS APP CODE

const express = require('express');

const data = require('./db/notes');

const app = express();

// DB

const { PORT } = require('./config');

const {requestLogger} = require('./middleware/logger');

const simDB = require('./db/simDB');

const notes = simDB.initialize(data);

// STATIC SERVER

app.use(express.static('public'));
app.use(requestLogger);

app.listen(8080, function () {
    console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
    console.error(err);
});

// SEARCH

app.get('/api/notes', (req, res, next) => {
    // res.json(data);
    const { searchTerm } = req.query;
    notes.filter(searchTerm, (err, list) => { 
        if (err) {
            return next(err); //to error handler
        }
        res.json(list); //array response
    })
  });



// app.get('/api/notes/:id', (req, res) => {
//     const foundItem = data.find(item => item.id == req.params.id);
//     res.json(foundItem);
//   });
  