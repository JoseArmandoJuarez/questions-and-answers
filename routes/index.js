var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
const { request } = require('express');
const { response } = require('../app');

var MongoClient = require('mongodb').MongoClient;

// connection to the database
var database = require('monk')('mongodb://192.168.208.237:27017/askaquestion');
var url = 'mongodb://192.168.208.237:27017/';
var showdown  = require('showdown');
var converter = new showdown.Converter();


/* GET home page. */
router.get('/', function(req, res, next) {
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("askaquestion");
    dbo.collection("posts").find({}).toArray(function(err, dbposts) {
      if (err) throw err;
      
      var posts = [];
      for(var i = dbposts.length - 1; i >= 0; --i){
          posts.push(dbposts[i]);
      }
      var resently = posts.slice(0, 3)


      var withAnswers = []
      for(var i = 0; i < dbposts.length; i++){
        if(dbposts[i].answers){
          withAnswers.push(dbposts[i]);
        }
      }
      var mostAnswered = withAnswers.slice(0, 3)

      res.render('index', { posts, resently, mostAnswered });
      db.close();
    });
  });
  
});

router.get('/questions', function(req, res, next){
  
  var unansweredTab = req.query.tab

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("askaquestion");
    dbo.collection("posts").find({}).toArray(function(err, dbposts) {
      if (err) throw err;

      var posts = [];
      for(var i = dbposts.length - 1; i >= 0; --i){

        var text = dbposts[i].question;
        var html = converter.makeHtml(text);
        dbposts[i].question = html

        posts.push(dbposts[i]);
      }

      var unanswerPost = [];
      if(unansweredTab){
        for(var i = 0; i < posts.length; i++){
          if(!posts[i].answers){
            unanswerPost.push(posts[i]);
          }
        }
      }

      res.render('questions', { posts, unanswerPost, unansweredTab });
      db.close();
    });
  });

});


// Get askaquestion page
router.get('/addpost', function(req, res, next){
  res.render('addpost', {title: 'Post a Question'})
});

// post askaquestion page
router.post('/addpost', function(req, res, next){
  
  // values
  var title = req.body.title;
  var category = req.body.category;
  var question = req.body.question;
  var date = new Date();

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('category', 'Category is required').notEmpty();
  req.checkBody('question', 'Question is required').notEmpty();

  var errors = req.validationErrors();
  
  if(errors){
    res.render('addpost', {
      errors: errors
    });
  } else {
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("askaquestion");

      var newPost = { title: title, category: category, question: question, date: date };

      dbo.collection("posts").insertOne(newPost, function(err, posts) {
        if (err) {
          throw err;
        }
        req.flash('success', 'Comment Added');
        res.location('/questions');
        res.redirect('/questions');
        db.close();
      });
    });
    
  }

  res.render('addpost', {title: 'Post a Question'})

});


// get post by id
router.get('/questions/show/:id', function(req, res, next){
  var posts = database.get('posts');

  posts.findById(req.params.id, function(err, post){

      // Turning the post to html text
      var posts = [];
      var text = post.question;
      var html = converter.makeHtml(text);
      post.question = html
      posts.push(post);

      // Turning answers to html text
      if(posts[0].answers){
        for(var i = posts[0].answers.length - 1; i >= 0; --i){
          var answer = posts[0].answers[i].answer;
          var html = converter.makeHtml(answer);
          posts[0].answers[i].answer = html;
          posts.push(posts[0].answers[i].answer);
          console.log(posts);
        }
      }
     

      res.render('show', {
          post: post
      });
  });
});


// Get about page
router.get('/about', function(req, res, next){
  res.render('about', {title: 'About'});
});


router.post('/questions/show/:id', function(req, res, next){
  // Get Form Values
  var answer = req.body.answer;
  var postid = req.body.postid;
  var answerDate = new Date();

  req.checkBody('answer', 'Answer is required').notEmpty();

  var errors = req.validationErrors();
  
  if(errors){
    var posts = database.get('posts');
    posts.findById(postid, function(err, post){
      res.render('show', {
        errors: errors,
        post: post
      });
    });
  } else {
    var answer = {
      answer: answer,
      answerDate: answerDate
    }

    var posts = database.get('posts');

      posts.update({
          "_id": postid
      }, {
          $push:{
              "answers": answer
          }
      }, function(err, doc){
          if(err){
              throw err;
          } else {
              req.flash('success', 'Comment Added');
              res.location('/questions/show/' + postid);
              res.redirect('/questions/show/' + postid);
          }
      });
  }
});


module.exports = router;
