var userInfo = require("xiaoyuer/userInfo"),
    order = require("xiaoyuer/order"),
    hire = require("xiaoyuer/hire")
    fs = require("fs"),
    request = require("request"),
    EventEmitter = require('events').EventEmitter;

var noteReady = new EventEmitter();
var sprintf = require("sprintf").sprintf;

var mybaseUrl = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).mybaseUrl;

exports.util = function(req,res){
    res.render('util',{});
}
/*
*订单相关api
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
                    case 0:
                        callback(result);
                        break;
                    case -1:
                        res.redirect("/user/tologin.html");
                        callback(-1);
                        break;

                }
            })
        }
        else{
            res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=http://" + mybaseUrl +"/web/order/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");

        }

    }

    function set_session(req,res){
         var code = req.query.code;
         var url_temp = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";
         var url = sprintf(url_temp,AppID,AppSecret,code);
         request(url,function(err,response,body){
             console.log(body);
             if (!err &&response.statusCode == 200) {
                  var openid_obj = JSON.parse(body) ;
                  req.session.openid = openid_obj.openid;
                  res.redirect("/web/order/index");
                }
         })

    }
    return {
        index:index,
        service:service,
        require:require,
        set_session:set_session
    }
})();

exports.order_test = function(req,res){
    res.render('orderlist',{
        username:"愚吉",
        credit:"三星",
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
    });
}

/*
 *发现
 * 利用req.session.openid
 */
exports.seek = function(req,res){
    res.render('seek',{
        new_items:10,
        services:[]
    })
}
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
     userInfo.login(req.session.openid,body.password,body.email,function(result){
         switch (result){
             case 0:
                 res.redirect("/user/success_login.html");
                 break;
             case -5:
                 res.redirect("/user/tologin.html");
                 break;
             case -6:
                 res.redirect("/user/tologin.html");
                 break;
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
             case 0:
                 res.send(JSON.stringify({code:0,info:"可用"}));
                 break;
             case -3:
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
            case 0:
                res.send(JSON.stringify({code:0,info:"可用"}));
                break;
            case -3:
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
            case 0:
                req.session.cert = result.cert;
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
    userInfo.register(req.session.openid,body.username,body.password,body.mobile,function(result){
          if(result.code==0)
            res.redirect("/user/reg_success.html")
    })
}

/*
*招聘
 */

exports.job = function(req,res){
    var body = req.body;
    console.log(body);
    hire.job_remind(body.name,body.mobile,body.email,body.job);
    res.redirect("/user/hire_success.html");
}
/*
*从链接登录
 */
exports.set_session_link = function(req,res){
    var code = req.query.code;
    var AppID = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppID;
    var AppSecret = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppSecret;
    var url_temp = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";
    var url = sprintf(url_temp,AppID,AppSecret,code);
    console.log(url);
    request(url,function(err,response,body){
        console.log(body);
        if (!err &&response.statusCode == 200) {
            var openid_obj = JSON.parse(body) ;
            req.session.openid = openid_obj.openid;
            res.redirect("/user/tologin.html");
        }
    })

}