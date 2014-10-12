var userInfo = require("xiaoyuer/userInfo"),
    order = require("xiaoyuer/order");


exports.util = function(req,res){
    res.render('util',{});
}
/*
*获取自己的订单列表
* 利用req.session.openid
 */
exports.order_list = function(req,res){
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
exports.order = function(req,res){
   var page = req.query.page;
   var t_type = req.query.type;
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
exports.user_info =  function(req,res){
    userInfo.getUserInfo(req.query.openid,function(result){
        res.send(result);
    })
}
/*
 *客服用
 * 根据openid
 *获取用户订单列表
 */
exports.order_list =  function(req,res){
    userInfo.getOrder(req.session.openid,function(result){
        res.send(result);
    })
}
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
            res.redirect("/user/success_register.html")
    })
}