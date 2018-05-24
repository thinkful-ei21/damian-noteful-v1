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
app.use(express.json());



app.put('/api/notes/:id', (req, res, next) => {
    const id = req.params.id;
  
    /***** Never trust users - validate input *****/
    const updateObj = {};
    const updateFields = ['title', 'content'];
  
    updateFields.forEach(field => {
      if (field in req.body) {
        updateObj[field] = req.body[field];
      }
    });
  
notes.update(id, updateObj, (err, item) => {
      if (err) {
        return next(err);
      }
      if (item) {
        res.json(item);
      } else {
        next();
      }
    });
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




app.get('/api/notes', (req, res, next) => {
	// const searchParam = req.query.searchTerm;
	// const filteredSearch = data.filter(note => note.title.includes(searchParam));
	// res.json(filteredSearch);

	const {searchTerm} = req.query;
	notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});


app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});


app.listen(8080, function () {
    console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
    console.error(err);
});