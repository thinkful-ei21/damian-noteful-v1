'use strict';

const express = require('express');

const router = express.Router();

const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);



router.get(function(req,res,next){
  const searchTerm = req.query.searchTerm;
  
  notes.filter(searchTerm, (err, list) =>{
    return err ? next(err) : res.json(list)
  })
});
  
  
router.get('/:id', function(req, res, next){
  const {id} = req.params;
  notes.find(id, (err, item) =>{
    return err ? next(err) : res.json(item)
  })
});
  
//NOTE UPDATE

router.put('/:id', function(req, res, next){
  const id = req.params.id;
  const updateObj = {};
  const updateFields = ['title', 'content'];
  
  updateFields.forEach(field =>{
    if(field in req.body){updateObj[field] = req.body[field]}
  });
  notes.update(id, updateObj, (err, item) => {
    if (err) {return next(err);}
    if (item) {res.json(item);}
    else {next();}
  })
});

//NOTE DELETE

router.delete('/:id', function(req,res, next){

  notes.delete(req.params.id, (err, item) =>{
    if (err){return next(err)}
    if (item) {res.status(204).end();}
    else {next();}
  });

});

//NOTE POST 

router.post('', function(req, res, next){
  if(!req.body.title){
    const err = new Error('missing title in request body');
    err.status = 400;
    next(err)
  }
  const newObj= {'title': req.body.title, 'content':req.body.content};
  notes.create(newObj,(err,item) =>{
    if (err){return next(err)};
    if (item){res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item)}
    else {next()}
  })
});