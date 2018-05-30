'use strict';

// Load array of notes
// const data = require('./db/notes');


// EXPRESS APP CODE

const express = require('express');

const data = require('./db/notes');

const app = express();

const morgan = require('morgan');

// DB

const { PORT } = require('./config');

const {requestLogger} = require('./middleware/logger');

const notesRouter = require('./router/notes.router');

const simDB = require('./db/simDB');

const notes = simDB.initialize(data);

// STATIC SERVER

app.use(express.static('public'));

app.use(morgan('dev'));

app.use(express.json());

app.use('/api', notesRouter);

//404

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});



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

//  Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

app.startServer = function (port) {
  return new Promise((resolve, reject) => {
    this.listen(port, function () {
      this.stopServer = require('util').promisify(this.close);
      resolve(this);
    }).on('error', reject);
  });
};

// Listen for incoming connections

if (require.main === module) {
  app.startServer(PORT).catch(err => {
    if (err.code === 'EADDRINUSE') {
      const stars = '*'.repeat(80);
      console.error(`${stars}\nEADDRINUSE (Error Address In Use). Please stop other web servers using port ${PORT}\n${stars}`);
    }
    console.error(err);
  });
}

module.exports = app; // Export for testing

