const express = require('express');
const session = require('express-session');
const mongoose = require("mongoose");

const MongoStore = require('connect-mongo')
const passport =  require('passport');

const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const dataRouter = require('./routes/data');
const userRouter = require('./routes/user');

const compression = require("compression");
const helmet = require("helmet");

require('dotenv').config();
require('./config/passport')


mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_DB_URI


const app = express();

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoDB,
    collectionName: 'sessions'
  }),
}))

app.use(passport.initialize());
app.use(passport.session());


main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/data', dataRouter);


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
