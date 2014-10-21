var userInfo = require("xiaoyuer/userInfo"),
    order = require("xiaoyuer/order"),
    hire = require("xiaoyuer/hire")
    fs = require("fs"),
    request = require("request"),
    pic_cache = require("xiaoyuer/pic-cache");
    EventEmitter = require('events').EventEmitter,
    area_class = require("xiaoyuer/area_class");

var noteReady = new EventEmitter();
var sprintf = require("sprintf").sprintf;

var mybaseUrl = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).mybaseUrl;

exports.util = function(req,res){
    res.render('util',{});
}
/*
*订单相关api
* 以为非阻塞，所以使用了事件保证两件事都完成
 */
exports.order = (function(){

    var AppID = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppID;
    var AppSecret = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppSecret;
    function index(req,res){
        user_info(req,res,function(result){
            if(result==-1){

            }
            else{
                var  render_obj = {};
                var count = 0;
                render_obj.user_info = result;
                order.get_require_order(req.session.openid,1,function(result1){
                    noteReady.emit("req_ready");
                    render_obj.require = result1;
                })
                order.get_service_order(req.session.openid,1,function(result2){
                    noteReady.emit("ser_ready");
                    render_obj.service = result2;
                })
                noteReady.on("req_ready",function(){
                    count +=1;
                    if(count == 2){
                        res.render("orderlist",render_obj);
                    }
                })
                noteReady.on("ser_ready",function(){
                    count +=1;
                    if(count == 2){
                        res.render("orderlist",render_obj);
                    }
                })
            }
        })
    }
    /*
    *分页获取服务单信息
     */
    function service(req,res){
        order.get_service_order(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }
    /*
     *分页获取需求单信息
     */
    function require(req,res){
        order.get_require_order(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }

    /*
    *获取用户信息
    * 若不存在openid的session则跳转
    *若未绑定则跳转到登录
     */
    function user_info(req,res,callback){
        if(req.session.openid){
            userInfo.getUserInfo(req.session.openid,function(result){
                switch(result.code){
                    case '0':
                        if(result.photo){
                            result.photo = "/images/"+pic_cache(result.phto);
                        }
                        callback(result);
                        break;
                    case '-1':
                        res.redirect("/user/tologin.html");
                        callback(-1);
                        break;

                }
            })
        }
        else{
            res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +"/order/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");

        }

    }

    function set_session(req,res){
         var code = req.query.code;
         var url_temp = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";
         var url = sprintf(url_temp,AppID,AppSecret,code);
         request(url,function(err,response,body){

             if (!err &&response.statusCode == 200) {
                  var openid_obj = JSON.parse(body) ;
                  if(openid_obj.openid){
                      req.session.openid = openid_obj.openid;
                      res.redirect("/web/order/index");
                  }
                  else{
                      res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +"/order/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");

                  }
                }
         })

    }

    function info(req,res){
        res.render("order_info",{
            title:"微信公众号开发",
            description:"第三方的，沙迪克，大叔\n峰会上凤凰科技\n发卡号是胡覅\n",
            order_id:31232434,
            offer:"愚吉",
            generation:"2014-10-15 23:10:09",
            status:"已支付"
        })

    }
    return {
        index:index,
        service:service,
        require:require,
        set_session:set_session,
        info:info
    }
})();

exports.order_test = function(req,res){
    res.render('orderlist',{
        username:"愚吉",
        credit:"三星",
        page1:{
            order_list:[{
                id:31244444434,
                price:"5000/次",
                generate_time:"Tue Sep 30 2014 09:10:38 GMT+0800"
            },
                {
                    id:31244444434,
                    price:"5000/次",
                    generate_time:"Tue Sep 30 2014 09:10:38 GMT+0800"
                },
                {
                    id:31244444434,
                    price:"5000/次",
                    generate_time:"Tue Sep 30 2014 09:10:38 GMT+0800"
                }]
        },
        page2:{
            order_list:[{
                id:31244444434,
                price:"1000/次",
                generate_time:"Tue Sep 30 2014 09:10:38 GMT+0800"
            },
                {
                    id:31244444434,
                    price:"51000/次",
                    generate_time:"Tue Sep 30 2014 09:10:38 GMT+0800"
                },
                {
                    id:31244444434,
                    price:"1000/次",
                    generate_time:"Tue Sep 30 2014 09:10:38 GMT+0800"
                }]
        }

    });
}

/*
 *发现
 * 利用req.session.openid
 */
exports.seek = (function(){
    function index(req,res){
        res.render('seek',{
            new_items:10,
            services:[]
        });
    }
     /*
     *发现-公益
      */
    function welfare(){
        /*
        *获取公益分类表
         */
        var classify = area_class.welfare_calssify.get();
        return{
            index: function(req,res) {
                res.render('seek', {
                    the_type:"乐活公益",
                    new_items:2,
                    type_id :"welfare",
                    items:[
                        {
                            title:"修电脑",
                            provider:"愚吉",
                            price:"公益服务，免费"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"公益服务，免费"
                        }
                    ]
                })
            },
            the_class : function(req,res){
                res.render('seek_class',{
                       type:"公益",
                       type_id :"welfare",
                       classify:classify
                })
            },
            info :function(req,res){
                res.render('seek_by_class', {
                    the_type:"乐活公益",
                    new_items:2,
                    class_name:area_class.welfare_calssify.get_name_by_id(req.query.id),
                    type_id :"welfare",
                    items:[
                        {
                            title:"修电脑",
                            provider:"愚吉",
                            price:"公益服务，免费"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"公益服务，免费"
                        }
                    ]
                })
            }
         }
     }

    function service(){
        var classify = area_class.classify.get();
        return{
            index:function(req,res) {
                res.render('seek', {
                    the_type:"四海服务",
                    new_items:2,
                    type_id :"service",
                    items:[
                        {
                            title:"微信公众平台",
                            provider:"愚吉",
                            price:"￥500/次"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"￥4000"
                        }
                    ]
                })
            },
            the_class: function(req,res){
                res.render("seek_class",{
                    type:"服务",
                    type_id :"service",
                    classify: classify
                })

            } ,
            info:function(req,res){
                res.render('seek_by_class', {
                    the_type:"四海服务",
                    new_items:2,
                    type_id :"service",
                    class_name:area_class.classify.get_name_by_id(req.query.id),
                    items:[
                        {
                            title:"微信公众平台",
                            provider:"愚吉",
                            price:"￥500/次"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"￥4000"
                        }
                    ]
                })
            }

        }
    }

    function requires(){
        var classify = area_class.classify.get();
        return{
            index:function(req,res) {
                res.render('seek', {
                    the_type:"四海需求",
                    new_items:2,
                    type_id :"require",
                    items:[
                        {
                            title:"微信公众平台",
                            provider:"愚吉",
                            price:"上限￥5000"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"￥15/小时"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"￥15/小时"
                        }
                    ]
                })
            },
            the_class: function(req,res){
                res.render("seek_class",{
                    type:"需求",
                    type_id :"require",
                    classify: classify
                })

            },
            info:function(req,res){
                res.render('seek_by_class', {
                    the_type:"四海需求",
                    new_items:2,
                    class_name:area_class.classify.get_name_by_id(req.query.id),
                    type_id :"require",
                    items:[
                        {
                            title:"微信公众平台",
                            provider:"愚吉",
                            price:"上限￥5000"
                        },
                        {
                            title:"剪草坪",
                            provider:"愚吉",
                            price:"￥15/小时"
                        }
                    ]
                })
            }

        }
    }
    return{
        welfare:welfare(),
        service:service(),
        require:requires()
    }
})();
 /*
 *客服用
 * 根据openid
 *获取用户基本信息
  */
exports.kf = (function(){

    function  user_info (req,res){
        userInfo.getUserInfo(req.query.openid,function(result){
            res.send(result);
        })
    }
    return {
        user_info :user_info,
        order_require: function(req,res){
            order.get_require_order(req.query.openid,req.query.page,function(result){
                res.send(result);
            })
        },
        /*客服用
         * 根据openid分页
         *获取用户服务订单列表
         */
        order_service:  function(req,res){
            order.get_service_order(req.query.openid,req.query.page,function(result){
                res.send(result);
            })
        }

    }
})();




/*
*用户登录
 */
exports.login = function(req,res){
    var body = req.body;
    req.session.openid = 1;
    console.log(body);
     userInfo.login(req.session.openid,body.password,body.username,function(result){
         switch (result){
             case '0':
                 res.redirect("/user/success_login.html");
                 break;
             case '-5':
                 res.redirect("/user/tologin.html");
                 break;
             case '-6':
                 res.redirect("/user/tologin.html");
                 break;
             default :
                 console.log(result);
         }
     })
}
/*
*检测用户名
 */
exports.check_username = function(req,res){
    var username = req.query.username;
    userInfo.check_nick(username,function(result){
         switch (result){
             case '0':
                 res.send(JSON.stringify({code:0,info:"可用"}));
                 break;
             case '-3':
                 res.send(JSON.stringify({code:-1,info:"已被注册"}));
                 break;
             default:
                 res.send(JSON.stringify({code:-200,info:"未知错误"}));

         }
    })
}
/*
*检测手机号
 */
exports.check_mobile = function(req,res){
    var phone_number = req.query.mobile;
    userInfo.check_mobile(phone_number,function(result){
        switch (result){
            case '0':
                res.send(JSON.stringify({code:0,info:"可用"}));
                break;
            case '-3':
                res.send(JSON.stringify({code:-1,info:"已被注册"}));
                break;
            default:
                res.send(JSON.stringify({code:-200,info:"未知错误"}));
        }
    })
} ;
/*
*获取验证码
 */
exports.get_cert = function(req,res){
    var phone_number = req.query.mobile;
    userInfo.get_code(phone_number,function(result){
        switch (result.code){
            case '0':
                req.session.cert = result.autocode;
                req.session.time = new Date().getTime();
                res.send(JSON.stringify(result));
                break;
            default:
                res.send(JSON.stringify({code:-200,info:"未知错误"}));
        }
    })
}
/*
*验证验证码
* @param cert
 */
exports.check_cert = function(req,res){
   if(new Date().getTime() - req.session.time > 800000){
       res.send(JSON.stringify({code:-11,info:"expired"}));
   }
   else if(req.session.cert == req.query.cert){
       res.send(JSON.stringify({code:0,info:"success"}));
   }
    else {
       res.send(JSON.stringify({code:-10,info:"wrong cert"}));
   }
}
/*
*注册新用户
 */
exports.register = function(req,res){
    var body = req.body;
    userInfo.register(req.session.openid,body.user_name,body.password,body.mobile_num,function(result){
          if(result.code=='0')
            res.redirect("/user/reg_success.html")
    })
}

/*
*招聘
 */

exports.job = function(req,res){
    var body = req.body;
    hire.job_remind(body.name,body.mobile,body.email,body.job);
    res.redirect("/user/test.html");
}
/*
*从链接登录
 */
exports.set_session_link = (function(){
    var AppID = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppID;
    var AppSecret = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppSecret;
    return  function(req,res){
        var code = req.query.code;

        var url_temp = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";
        var url = sprintf(url_temp,AppID,AppSecret,code);
        request(url,function(err,response,body){

            if (!err &&response.statusCode == 200) {
                var openid_obj = JSON.parse(body) ;
                req.session.openid = openid_obj.openid;
                res.redirect("/user/tologin.html?t="+new Date().getTime());
            }
        })

    }
})() ;