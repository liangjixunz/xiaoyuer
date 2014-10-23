var request = require("request");
var db = require("xiaoyuer/gift/db");
var fs =require("fs");

var mybaseUrl = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).mybaseUrl;

exports.event_info= function(req,res){
    db.is_hire(req.query.event_id,function(result){

        if(result){
            db.get_event_info(req.query.event_id,function(result1){
                res.render('hire',result1);

            })
        }
        else{
            db.get_event_info(req.query.event_id,function(result1){
                res.render('forwarding',result1);

            })
        }
    })

}

exports.event_index = function(req,res){
    if(!req.session.openid){
        res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +"/event/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");
    }
    else {
        db.new_user(req.session.openid,function(res2){
            var obj = {
                event_effect: [],
                event_over: [],
                username: "愚吉",
                user_banlance: "",
                withdraw: ""
            };
            db.get_event_index(function (result) {
                if(result){
                    result.forEach(function (value) {
                        db.get_ever_get(value.event_id, req.session.openid, function (result2) {
                            value.left_time = value.max_time - result2.total_time;
                            if (new Date(value.event_finish) > new Date()) {
                                obj.event_effect[obj.event_effect.length] = value;
                            }
                            else
                                obj.event_over[obj.event_over.length] = value;
                        })

                    })
                    db.user_info(req.session.openid, function (result1) {
                        obj.user_banlance = result1.user_balance;
                        obj.withdraw = result1.withdraw;
                        res.render("gift_list", obj);
                    })
                }
                else
                    res.send(500);

            })
        })

    }
}

/*
*用户试图访问活动列表时
* 首先获得用户openid
* 若新用户则存入数据库
 */
exports.set_session = (function(req,res){

    var app_conf = JSON.parse(fs.readFileSync(__dirname + "/../shared/appConfig"));

    return function(req,res){
        var code = req.query.code;
        var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=";
        url += app_conf.AppID;
        url += "&secret=";
        url += app_conf.AppSecret;
        url += "&code=";
        url += code;
        url += "&grant_type=authorization_code";
        request(url,function(err,response,body){
            if (!err &&response.statusCode == 200) {
                var openid_obj = body ;
                try{
                    openid_obj = JSON.parse(body);
                }
                catch (e){
                    console.log(e);
                }
                req.session.openid = openid_obj.openid;
                db.new_user(req.session.openid,function(result){
                    console.log(result);
                })
                res.redirect("/web/event/index");

            }
        })

    }

})();
/*
*点击了分享链接后的处理
 */
exports.repostPre = (function(){

    var app_conf = JSON.parse(fs.readFileSync(__dirname + "/../shared/appConfig"));
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=";
    url += app_conf.AppID;
    url += "&secret=";
    url += app_conf.AppSecret;
    url += "&code=";

    return function(req,res){
        var code = req.query.code;
        var openid_from = req.path.match(/\/repost\/[^\/]+/)[0].slice(8);
        var event_id = req.path.match(/\/id\/[^\/]+/)[0].slice(4);
        url += code;
        url += "&grant_type=authorization_code";
        request(url,function(err,response,body){
            if (!err &&response.statusCode == 200) {
                var openid_obj = body ;
                try{
                   openid_obj = JSON.parse(body);
                }
                catch (e){
                    console.log(e);
                }
                db.new_user(openid_obj.openid,function(result){
                    ;
                })
                db.new_award(openid_from,openid_obj.openid,event_id,function(result){
                    req.session.openid = openid_obj.openid;
                    res.redirect("/web/event/info?event_id="+event_id +"&over=0");
                })
            }
        })
        url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=";
        url += app_conf.AppID;
        url += "&secret=";
        url += app_conf.AppSecret;
        url += "&code=";
    }
})();



