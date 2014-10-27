var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs")

var routes = require('./routes');
var app = express();
var signature_check = (function(){

    var token = JSON.parse(fs.readFileSync(__dirname+"/shared/appConfig")).token;

    return function(req,res,next){
        console.log("hi");
        var sha1 = crypto.createHash('sha1')
        sha1.update(token);
        if(req.query.timestamp&&req.query.check){
            sha1.update(req.query.timestamp);
            if(req.query.check==sha1.digest('hex')){
                next();
            }
            else
                res.send(JSON.stringify({code:"-10","err":"permission denied"}))
        }
        else
            res.send(JSON.stringify({code:"-10","err":"permission denied"}))
    }
})();

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
app.get('/util', routes.user.util);
/*
*客服使用的API
 */
app.get('/kf/info',routes.user.kf.user_info);
app.get('/kf/order/service',routes.user.kf.order_service);
app.get('/kf/order/require',routes.user.kf.order_require)

/*
*用户的订单列表
 */
app.get('/order/index', routes.user.order.index);
app.get('/order/service1',routes.user.order.service1);
app.get('/order/require1',routes.user.order.require1);
app.get('/order/service2',routes.user.order.service2);
app.get('/order/require2',routes.user.order.require2);
app.get('/order/wservice1',routes.user.order.wservice1);
app.get('/order/wrequire1',routes.user.order.wrequire1);
app.get('/order/wservice2',routes.user.order.wservice2);
app.get('/order/wrequire2',routes.user.order.wrequire2);
app.get("/order/game1",routes.user.order.game1);
app.get('/order/game2',routes.user.order.game2)
app.get('/order/fromwe',routes.user.order.set_session);
app.get('/order/info',routes.user.order.info)
/*
*发现
 */

app.get('/seek/wrequire/index', routes.user.seek.wrequire.index);
app.get('/seek/wrequire/class', routes.user.seek.wrequire.the_class);
app.get('/seek/wrequire/info',routes.user.seek.wrequire.info);
app.get('/seek/wrequire/class/info',routes.user.seek.wrequire.class_info);
app.get('/seek/wrequire/more',routes.user.seek.wrequire.page_class);
;
app.get('/seek/wservice/index', routes.user.seek.wservice.index);
app.get('/seek/wservice/class', routes.user.seek.wservice.the_class);
app.get('/seek/wservice/info',routes.user.seek.wservice.info);
app.get('/seek/wservice/class/info',routes.user.seek.wservice.class_info);
app.get('/seek/wservice/more',routes.user.seek.wservice.page_class);

app.get('/seek/service/fromwe',routes.user.seek.service.set_session);
app.get('/seek/service/index', routes.user.seek.service.index);
app.get('/seek/service/class/info',routes.user.seek.service.class_info);
app.get('/seek/service/class', routes.user.seek.service.the_class);
app.get('/seek/service/info',routes.user.seek.service.info);
app.get('/seek/service/more',routes.user.seek.service.page_class);
app.get("/seek/service/collect",routes.user.seek.service.collect)

app.get('/seek/require/fromwe',routes.user.seek.require.set_session);
app.get('/seek/require/index', routes.user.seek.require.index);
app.get('/seek/require/class/info',routes.user.seek.require.class_info);
app.get('/seek/require/class', routes.user.seek.require.the_class);
app.get('/seek/require/info',routes.user.seek.require.info);
app.get('/seek/require/more',routes.user.seek.require.page_class);
app.get("/seek/require/collect",routes.user.seek.require.collect)

app.get('/seek/game/fromwe',routes.user.seek.game.set_session);
app.get('/seek/game/index', routes.user.seek.game.index);
app.get('/seek/game/info', routes.user.seek.game.info);
app.get('/seek/game/more',routes.user.seek.game.page_class);
app.get("/seek/game/collect",routes.user.seek.game.collect)

app.get('/test1',function(req,res){
    res.render("info",{
        title:"微信公众号开发",
        description:"第三方的，沙迪克，大叔\n峰会上凤凰科技\n发卡号是胡覅\n",
        sold:10,
        offer:"愚吉",
        generation:"2014-10-15 23:10:09",
        price:"300/次"
    })
})
app.post('/test',function(req,res){
    console.log(req.body);
    res.send(JSON.stringify(req.body));
})
/*
*精选服务
 *
app.get('/oneorder',oneservice.order)
app.get('/pay/oneservice',function(req,res){
    res.render("oneservice",{});
})
app.get('/test/oneservice',function(req,res){
    res.render("oneservice",{});
})
*/


/*
*点击的分享链接
 */
/*
*送红包的路由处理
 */

/*
*招聘
 */
app.post("/user/job",routes.user.job)

app.get("/event/withdraw",routes.event.event_withdraw)
app.get("/event/withdraw/new",routes.event.new_withdraw)
app.get('/event/whoisme',function(req,res){

    res.send(req.session.openid);
})
/*
*点击链接
 */
app.get(/\/repost[\s\S]+/,routes.event.repostPre);
app.get('/event/fromwe',routes.event.set_session)
/*
*微信端用户获取活动列表
* 以及其基本信息
 */
app.get('/event/index',routes.event.event_index);
app.get('/forwarding',routes.event.repostPre);
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
app.post('/myadmin/event/new',admin_check,routes.admin.new_event) ;

app.get('/myadmin/event/index',admin_check,routes.admin.event_index);

app.get('/event/info',routes.event.event_info);

app.get('/myadmin/event/withdraw',admin_check,routes.admin.event_withdraw_info);

app.get('/myadmin/event/forwardinginfo',admin_check,routes.admin.event_forwarding_info);

app.get('/event/basicinfo',admin_check,routes.admin.event_info)

/*
*设置自动回复
 */
app.get('/myadmin/setreply',admin_check,routes.admin.reply_set);
/*
*更新地区和分类
 */
app.post('/myadmin/area/update',signature_check,routes.admin.area_update);
app.post("/myadmin/class/update",signature_check,routes.admin.class_update);
app.post("/myadmin/welfare/update",signature_check,routes.admin.welfare_class_update)
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
/*
*从图文链接进入登录
 */
app.get('/user/fromwe',routes.user.set_session_link)
/*
*用户登录和注册
* 页面都是静态文件
* 异步处理
 */
/*
*检测昵称
 */
app.get('/user/check/nick',routes.user.check_username);
/*
*检测手机号是否占用
* @param
 */
app.get('/user/check/mobile',routes.user.check_mobile);
/*
*获取验证码
 */
app.get("/user/get/cert",routes.user.get_cert);
/*
*检测验证码
 */
app.get('/user/check/code',routes.user.check_cert);
/*
*注册接口
 */
app.post('/user/register',routes.user.register);
/*
*登录接口
* 结果是绑定和设定session
 */
app.post('/user/login',routes.user.login);
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

/*process.on('uncaughtException', function (err) {
    console.log('Caught Exception:' + err);//直接捕获method()未定义函数，Node进程未被退出。
});*/
module.exports = app;
