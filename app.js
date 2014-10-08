var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs")

var routes = require('./routes');
var users = require('./routes/user');
var gift = require('./routes/event');
var admin = require('./routes/admin');
var oneservice = require('./routes/oneservice');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Aesop'));
app.use(express.cookieSession());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);
app.get('/users', users.list);
app.get('/util', users.util);
app.get('/orderlist', users.order);
app.get('/seek', users.seek);

app.get('/oneorder',oneservice.order)
app.get('/oneservice',function(req,res){
    res.render("oneservice",{});
})
/*
*点击的分享链接
 */
/*
*送红包的路由处理
 */
app.get('/event/whoisme',function(req,res){

    res.send(req.session.openid);
})
app.get(/\/repost[\s\S]+/,gift.repostPre);
app.get('/event/fromwe',gift.set_session)
app.get('/event/index',gift.event_index);
app.get('/forwarding',gift.repostPre);
app.get('/myadmin/au',function(req,res){
    res.send("hello");
})
app.post('/myadmin/auth',function(req,res){
    console.log(req.body.email);
    var data;
    try {

        data = fs.readFileSync(__dirname+'/shared/admin');
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log('File not found!');
        } else {
            throw e;
        }
    }
   var obj = JSON.parse(data);
    console.log(obj);
    if(req.body.email==obj.email&&req.body.password==obj.password){
        req.session.name = req.body.email;
        res.redirect("/web/admin/index.html");
    }
    else
        res.send("error");
})
app.post('/myadmin/event/new',admin_check,admin.new_event) ;

app.get('/myadmin/event/index',admin_check,admin.event_index);

app.get('/event/info',gift.event_info);

app.get('/myadmin/event/withdraw',admin_check,admin.event_withdraw_info);

app.get('/myadmin/event/forwardinginfo',admin_check,admin.event_forwarding_info);
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function admin_check(req,res,next){
    console.log("hello");
    console.log(__dirname);
    var str = fs.readFileSync(__dirname+"/shared/admin");
    var obj = JSON.parse(str);
    if(req.session.name==obj.email){
        next();
    }
    else{
       res.redirect('/web/admin/sign_in.html');
    }
}

module.exports = app;
