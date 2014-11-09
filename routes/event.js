var request = require("request");
var db = require("xiaoyuer/gift/db");
var fs =require("fs");
var  EventEmitter = require('events').EventEmitter;

var mybaseUrl = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).mybaseUrl;

exports.event_info= function(req,res){
   db.get_activity_info(req.query.event_id,function(description){
       if(description.is_hire){
             res.render("hire",description);
       }
       else{
           res.render("forwarding",description);
       }
   })

}

exports.event_index = function(req,res){
    if(!req.session.openid){
        res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +"/event/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");
    }
    else {
        db.get_user_info(req.session.openid,function(userInfo){
            var obj = {
                event_effect: [],
                user_info: ""
            };
           obj.user_info = userInfo;

            db.get_holding_activity(function(activities){
                var arr = [];
                activities.forEach(function(value){
                     arr[arr.length] = value.activity_id;
                })
                db.get_left_chance(req.session.openid,arr,function(result1){
                    result1.forEach(function(value,index){
                        activities[index].left_chance = activities[index].max_time - value;
                    })
                    obj.event_effect = activities;
                    res.render("gift_list", obj);
                })

            })
        })

    }
}
/*
*@ TODO 抽奖结果
 */
exports.new_lottery = function(req,res){
    if(!req.session.openid){
        res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +"/event/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");
    }
    else{
        db.lottery_generate(req.session.openid,function(result){
           res.send("");
        })
    }
}
/*
*获取抽奖结果信息
 */
exports.code2info = function(req,res){
    req.session.lottry_id =  req.query.id;
    db.getAwardAddInfo(req.query.id,function(result){

        res.send(result);
    })
}
/*
*用户提交领奖信息
 */
exports.setAwardAddress = function(req,res){
    db.fillAwardAddress(req.session.lottery_id,req.body.address,req.body.mobile);
    res.redirect("/user/hire_success.html");
}
/*
*抽奖首页
 */
exports.lotteryIndex = function(req,res){
    if(!req.session.openid){
        res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +"/event/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");
    }
    else{
        db.get_user_info(req.session.openid,function(userInfo){
               var obj = {
                   user_info: userInfo,
                   lottery_his:[]
               }

              db.lottery_history(req.session.openid,function(myHistory){
                  var event = new EventEmitter();
                  var wait = 0;
                  if(myHistory.length){
                      for (var i = 0; i< myHistory.length; i +=1){
                          (function(){
                              var _i = i;
                              myHistory[_i].lottery_generate = new Date(myHistory[_i].lottery_generate).Format("yy-MM-dd hh:mm:ss");
                              if(myHistory[_i].is_award){
                                  wait += 1;
                                  db.getAwardInfo(myHistory[_i].award_code,function(result1){
                                        myHistory[_i].name = result1.award_name;
                                      event.emit("ready");
                                  })
                              }
                          })()


                      }

                      obj.lottery_his = myHistory;

                  }
                  if(wait==0)
                      res.render("gift_withdraw",obj);
                  event.on("ready",function(){
                      wait -= 1;
                      if(wait==0)
                        res.render("gift_withdraw",obj);
                  });

              })
        })
    }
}
/*
*新的抽奖
 */

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


    return function(req,res){
        var code = req.query.code;
        var openid_from = req.path.match(/\/repost\/[^\/]+/)[0].slice(8);
        var event_id = req.path.match(/\/id\/[^\/]+/)[0].slice(4);
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
                db.process_click(openid_from,openid_obj.openid,event_id);
                req.session.openid = openid_obj.openid;
                res.redirect("/web/event/info?event_id="+event_id +"&over=0");
            }
        })

    }
})();



