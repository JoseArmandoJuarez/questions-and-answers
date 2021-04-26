var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var expressValidator = require('express-validator');


var mongo = require('mongodb')
// connection to the database
var db = require('monk')('mongodb://192.168.208.237:27017/askaquestion');


var indexRouter = require('./routes/index');

var app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Express Validator
app.use(expressValidator({
  errorFormat: (param, msg, value) => {
    var namespace = param.split('.');
    var root = namespace.shift();
    var formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}));

//Connect-flash
app.use(require('connect-flash')());
//app.use(flash());
app.use((request, response, next) => {
  // this is how to create a global variable. IN this case is messages
  response.locals.messages = require('express-messages')(request, response);
  next();
});




// Make the database accessible to the routers (middleware)
app.use(function(req, res, next){
  req.db = db;
  next();
});


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
