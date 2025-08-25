var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notificateRouter = require('./routes/notificate');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// 加一个全局中间件，明确禁止翻越目录，禁止对 .git .env的访问
// app.use((req, res, next) => {
//     if (req.url.includes('..') || req.url.includes('.git') || req.url.includes('.env')) {
//         return res.status(403).send('Forbidden');
//     }
//     next();
// });

// ✅ 禁用 "X-Powered-By"
app.disable('x-powered-by'); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notificate', notificateRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    //   res.locals.message = err.message;
    //   res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //   res.render('error');
    res.send({
        error: err.message || "Something went wrong",
        status: err.status || 500
    });
});

module.exports = app;
