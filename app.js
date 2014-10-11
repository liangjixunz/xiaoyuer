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

/*
*客服所用页面
 */
app.get('/util', users.util);
/*
*客服使用的API
 */
app.get('/kf/info',users.user_info);

app.get('/kf/orderinfo',users.order_list)
/*
*用户的订单列表
 */
app.get('/orderlist', users.order_list);
app.get('/order',user.order);
/*
*发现
 */
app.get('/seek', users.seek);

/*
*精选服务
 */
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
/*
*点击链接
 */
app.get(/\/repost[\s\S]+/,gift.repostPre);
app.get('/event/fromwe',gift.set_session)
/*
*微信端用户获取活动列表
* 以及其基本信息
 */
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
        req.session.adminname = req.body.email;
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

app.get('/event/basicinfo',admin_check,admin.event_info)

/*
*设置自动回复
 */
app.get('/myadmin/setreply',admin_check,admin.reply_set);
/*
*更新地区和分类
 */
app.post('/myadmin/area/update',admin.area_update);
app.post("/myadmin/classify/update",admin.class_update);
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
    var str = fs.readFileSync(__dirname+"/shared/admin");
    var obj = JSON.parse(str);
    if(req.session.adminname==obj.email){
        next();
    }
    else{
       res.redirect('/web/admin/sign_in.html');
    }
}

module.exports = app;
