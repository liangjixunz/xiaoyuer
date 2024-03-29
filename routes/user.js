var userInfo = require("xiaoyuer/userInfo"),
    orders = require("xiaoyuer/order"),
    hire = require("xiaoyuer/hire"),
    fs = require("fs"),
    seek = require("xiaoyuer/seek"),
    request = require("request"),
    pic_cache = require("xiaoyuer/pic-cache"),
    EventEmitter = require('events').EventEmitter,
    area_class = require("xiaoyuer/area_class");


var sprintf = require("sprintf").sprintf;

var mybaseUrl = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).mybaseUrl;
var AppID = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppID;
var AppSecret = JSON.parse(fs.readFileSync(__dirname+"/../shared/appConfig")).AppSecret;

exports.util = function(req,res){
    res.render('util',{});
}

function set_session(redirect_add_success,redirect_add_fail){
    this.set_session = function(req,res){
        var code = req.query.code;
        var url_temp = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";
        var url = sprintf(url_temp,AppID,AppSecret,code);
        request(url,function(err,response,body){
            console.log(body);
            if (!err &&response.statusCode == 200) {
                var openid_obj = JSON.parse(body) ;
                if(openid_obj.openid){
                    req.session.openid = openid_obj.openid;
                    res.redirect(redirect_add_success);
                }
                else{
                    res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +redirect_add_fail+"&response_type=code&scope=snsapi_base&state=1#wechat_redirect");

                }
            }
        })
    }
    this.force = function(req,res){
        res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd339e5a03048eb3&redirect_uri=" + mybaseUrl +redirect_add_fail+"&response_type=code&scope=snsapi_base&state=1#wechat_redirect");
    }


}
/*
*订单相关api
* 以为非阻塞，所以使用了事件保证两件事都完成
* 坑爹的垃圾回收
 */
exports.order = (function(){

    function index(req,res){
        user_info(req,res,function(result){
            console.log(result);
            if(result == '-1'){
                  ;
            }
            else{
                (function(){
                    var noteReady = new EventEmitter();
                    var  render_obj = {};
                    var count = 0;
                    render_obj.user = result;
                    for(var value in orders.get_order_list){
                        (function(){
                            var value1 = value;
                            orders.get_order_list[value1](req.session.openid,1,function(result1){
                                console.log(result1);
                                if(result1.code == '0'){
                                    var temp = [];
                                    var temp1 ={};
                                    result1.ordeList.forEach(function(values){
                                        temp1 = JSON.parse(values);

                                        temp[temp.length] = temp1;
                                    });
                                    render_obj[value1]= temp;
                                }
                                else{
                                    render_obj[value1]= [];
                                }
                                noteReady.emit("ready");

                            });
                        })();
                    }
                    noteReady.on("ready",function(){
                        count +=1;
                        if(count == 10){
                            console.log(render_obj);
                            res.render("orderlist",render_obj);
                            count = 0;
                        }

                    })
                }) ();

            }
        })
    }
    /*
    *分页获取服务单信息
     */
    function service1(req,res){
        orders.get_order_list.service1(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }
    function service2(req,res){
        orders.get_order_list.service2(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }
    /*
     *分页获取需求单信息
     */
    function require1(req,res){
        orders.get_order_list.require1(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }

    function require2(req,res){
        orders.get_order_list.service2(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }

    function game1(req,res) {
        orders.get_order_list.game1(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }
    function game2(req,res) {
        orders.get_order_list.game1(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }

    function wservice1(req,res){
        orders.get_order_list.wservice1(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }
    function wservice2(req,res){
        orders.get_order_list.wservice2(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }
    /*
     *分页获取需求单信息
     */
    function wrequire1(req,res){
        orders.get_order_list.wrequire1(req.session.openid,req.query.page,function(result){
            res.send(result);
        })
    }

    function wrequire2(req,res){
        orders.get_order_list.wservice2(req.session.openid,req.query.page,function(result){
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

                        callback(result);
                        break;
                    case '-1':
                        res.redirect("/user/tologin.html");
                        callback(-1);
                        break;
                    default:
                        res.redirect("/user/tologin.html");
                        callback(-1);
                        break;
                }
            })
        }
        else{
            callback('-1');
           res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxdfca784ad548eea0&redirect_uri=" + mybaseUrl +"/order/fromwe&response_type=code&scope=snsapi_base&state=1#wechat_redirect");
        }

    }
   /*
   *命名会导致循环引用
    */
    function set_session1(req,res){
        new set_session("/web/order/index","/order/fromwe").set_session(req,res);
    }

    function info(req,res){
        orders.getOrderInfo(req.query.id,req.session.openid,req.query.type,function(result){
            if(result.code=='0'){
                detailList = [];
                result.detailList.forEach(function(value){
                    detailList[detailList.length] = JSON.parse(value);
                })
                detailList = detailList.reverse();
                console.log(detailList)
                res.render("order_info",{
                    id: req.query.id,
                    detaiList:detailList
                })
            }

        })


    }
    return {
        index:index,
        service1:service1,
        require1:require1,
        service2:service2,
        require2:require2,
        wservice1:wservice1,
        wservice2:wservice2,
        wrequire1:wrequire1,
        wrequire2:wrequire2,
        game1:game1,
        game2:game2,
        set_session:set_session1,
        info:info
    }
})();

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
    *发现-大赛
     */
    function game(){
        var the_session = new set_session("/web/seek/game/index","/seek/game/fromwe");
        return{
            index : function(req,res){
                if(req.session.openid)
                    seek.seek.games("1",req.query.orderfield,function(result){
                    if(result.code == '0'){
                        var resObj = [];
                        var temp = {};
                        result.lst.forEach(function(value){
                            temp = JSON.parse(value);

                            try{
                                     temp.gameImageAtt = pic_cache.cache(temp.gameImageAtt);
                            }
                           catch (e){
                               console.log(e);
                           }
                            temp.apllayEndTime = new Date(temp.apllayEndTime).Format("20yy年MM月dd日 hh:mm:ss")
                            resObj[resObj.length] = temp;

                        })
                        res.render("seek-game",{
                            the_type:"缤纷大赛",
                            new_items:2,
                            type_id :"game",
                            items:resObj
                        })
                    }
                        else{
                        res.render("seek-game",{
                            the_type:"缤纷大赛",
                            new_items:2,
                            type_id :"game",
                            items:[]
                        })
                    }
                });
                else{
                    the_session.force(req,res);
                }

            },
            info:  function(req,res){
                seek.info("game",req.query.id,function(result){
                    try{
                        var resObj = JSON.parse(result);
                        resObj.code = 0;
                        resObj.gameFinishTime= new Date(resObj.gameFinishTime).Format("20yy年MM月dd日 hh:mm:ss");
                        resObj.apllayEndTime = new Date(resObj.apllayEndTime).Format("20yy年MM月dd日 hh:mm:ss");
                        resObj.gameDes = html_decode(resObj.gameDes);
                        resObj.apllayMinNum = resObj.apllayMinNum ||"无要求";
                        res.render('detail-game',resObj);
                    }
                    catch (e){
                        console.log(e);
                        res.send(404);
                    }



                })
            },
            page_class: function(req,res){
                seek.seek.games(req.query.page,req.query.orderfield,function(result){
                    res.send(result);
                })
            } ,
            collect:function(req,res){
               seek.collet(req.query.id,req.session.openid,"game",function(result){
                   res.send(result);
               })
            },
            is_collect:function(req,res){
                seek.is_collect(req.query.id,req.session.openid,"game",function(result){
                    res.send(result);
                })
            },
            set_session: the_session.set_session

        }
    }
    /*
     *发现-公益服务
     */
    function wservice(){

        return{
            index: function(req,res) {
                seek.seek.wel_service("","1","",function(result){
                    if(result.code ==0){
                        var resObj = [];
                        var temp = {};
                        result.lst.forEach(function(value){
                            temp = JSON.parse(value);
                            try{

                                temp.serviceImageAtt = pic_cache.cache(temp.gameImageAtt);
                            }
                           catch (e){
                               console.log(e);
                           }
                            resObj[resObj.length] = temp;
                        })
                        res.render("seek-wservice",{
                            the_type:"乐活公益",
                            new_items:2,
                            type_id :"wservice",
                            items:resObj
                        })


                    }
                    else{
                        res.render("seek-wservice",{
                            the_type:"公益服务",
                            new_items:2,
                            type_id :"wservice",
                            items:[]
                        })
                    }
                })

            },
            the_class : function(req,res){
                var classify = area_class.welfare_calssify.get();
                res.render('seek_class',{
                    type:"公益服务",
                    type_id :"wservice",
                    classify:classify
                })
            },
            class_info: function(req,res) {
                seek.seek.wel_service(req.query.class,"1",req.query.orderfield,function(result){
                    if(result.code ==0){
                        var resObj = [];
                        var temp = {};
                        result.lst.forEach(function(value){
                            temp = JSON.parse(value);
                            try{

                                temp.serviceImageAtt = pic_cache.cache(temp.serviceImageAtt);
                            }
                            catch (e){
                                console.log(e);
                            }
                            resObj[resObj.length] = temp;
                        })
                        res.render("seek-class-wservice",{
                            the_type:"乐活公益",
                            new_items:2,
                            class_name:area_class.welfare_calssify.get_name_by_id(req.query.class),
                            type_id :"wservice",
                            items:resObj
                        })


                    }
                    else{
                        res.render("seek-class-wservice",{
                            the_type:"公益服务",
                            new_items:2,
                            class_name:area_class.welfare_calssify.get_name_by_id(req.query.class),
                            type_id :"wservice",
                            items:[]
                        })
                    }
                })

            },
            info :function(req,res){
                seek.info("wservice",req.query.id,function(result){
                    try{
                        var  resObj = JSON.parse(result);
                        var  uri;
                        try{

                            resObj.serviceImageAtt =  pic_cache.cache(resObj.serviceImageAtt);
                        }
                        catch (e){
                            console.log(e);
                        }

                        resObj.servDes = html_decode(resObj.servDes);
                        resObj.endDate = new Date(resObj.endDate).Format("20yy年MM月dd日 hh:mm:ss")
                        res.render('detail-wservice',resObj);
                    }
                    catch (e){
                        console.log(e);
                        res.send(404);
                    }
                })

            } ,
            page_class: function(req,res){
                seek.seek.wel_service(req.query.class,req.query.page,req.query.orderfield,function(result){
                    res.send(result);
                })
            }
        }
    }
     /*
     *发现-公益需求
      */
    function wrequire(){

        return{
            index: function(req,res) {
                seek.seek.wel_require("","1","",function(result){
                    if(result.code ==0){
                       var resObj = [];
                       var temp = {};
                       result.lst.forEach(function(value){
                           temp = JSON.parse(value);
                           try{
                               temp.attCoverStore = pic_cache.cache(temp.attCoverStore );
                           }
                           catch (e){
                               console.log(e);
                           }
                           resObj[resObj.length] = temp;
                       })
                        res.render("seek-wrequire",{
                            the_type:"公益需求",
                            new_items:2,
                            type_id :"wrequire",
                            items:resObj
                        })


                    }
                    else{
                        res.render("seek-wrequire",{
                            the_type:"公益需求",
                            new_items:2,
                            type_id :"wrequire",
                            items:[]
                        })
                    }
                })

            },
            the_class : function(req,res){
                var classify = area_class.welfare_calssify.get();
                res.render('seek_class',{
                       type:"公益需求",
                       type_id :"wrequire",
                       classify:classify
                })
            },
            class_info: function(req,res) {
                seek.seek.wel_require(req.query.class,"1",req.query.orderfield,function(result){
                    if(result.code ==0){
                        var resObj = [];
                        var temp = {};
                        result.lst.forEach(function(value){
                            temp = JSON.parse(value);
                            try{

                                temp.attCoverStore = pic_cache.cache(temp.attCoverStore);
                            }
                            catch (e){
                                console.log(e);
                            }
                            resObj[resObj.length] = temp;
                        })
                        res.render("seek-class-wrequire",{
                            the_type:"公益需求",
                            new_items:2,
                            class_name:area_class.welfare_calssify.get_name_by_id(req.query.class),
                            type_id :"wrequire",
                            items:resObj
                        })


                    }
                    else{
                        res.render("seek-class-wrequire",{
                            the_type:"公益需求",
                            new_items:2,
                            type_id :"wrequire",
                            class_name:area_class.welfare_calssify.get_name_by_id(req.query.class),
                            items:[]
                        })
                    }
                })

            },
            info :function(req,res){
                seek.info("wrequire",req.query.id,function(result){
                    var resObj = result;
                    try{
                        resObj = JSON.parse(result);
                        resObj.releaseTime = new Date(resObj.releaseTime).Format("20yy年MM月dd日 hh:mm:ss");
                        resObj.requireFinishTime = new Date(resObj.requireFinishTime).Format("20yy年MM月dd日 hh:mm:ss");
                        resObj.welfareProjectDes = html_decode( resObj.welfareProjectDes)  ;

                        resObj.attCoverStore =  pic_cache.cache( resObj.attCoverStore);
                        res.render('detail-wrequire',resObj);
                    }
                    catch (e){
                        console.log(e);
                        res.send(404);
                    }

                })
            } ,
            page_class: function(req,res){

                seek.seek.wel_require(req.query.class,req.query.page,req.query.orderfield,function(result){
                    res.send(result);
                })
            }
         }
     }

    function service(){
        var classify = area_class.classify.get();
        var the_session = new set_session("/web/seek/service/index","/seek/service/fromwe");
        return{
            index:function(req,res) {
                if(req.session.openid)
                    seek.seek.service("","1","",function(result){
                    var resObj = [];
                    var temp = {};
                    /*
                    *给的根本不是json
                     */
                    if(result.code == 0){
                        result.lst.forEach(function(value){
                            temp  =  JSON.parse(value);
                            try{

                                temp.serviceImageAtt = pic_cache.cache(temp.serviceImageAtt);
                            }
                             catch (e){
                                 console.log(e);
                             }
                            resObj[resObj.length] = temp;
                        })
                        res.render('seek-service',{
                            the_type:"四海服务",
                            new_items:2,
                            type_id :"service",
                            items:resObj
                        })
                    }
                    else{
                        res.render('seek', {
                            the_type:"四海服务",
                            new_items:2,
                            type_id :"service",
                            items:[

                            ]
                        })
                    }
                });
                else
                    the_session.force(req,res);

            },
            the_class: function(req,res){
                res.render("seek_class",{
                    type:"服务",
                    type_id :"service",
                    classify: classify
                })

            } ,
            class_info:function(req,res){
                seek.seek.service(req.query.class,"1",req.query.orderfield,function(result){
                    var resObj = [];
                    var temp = {};
                    /*
                     *给的根本不是json
                     */
                    if(result.code == 0){
                        result.lst.forEach(function(value){
                            temp  =  JSON.parse(value);

                            try{
                                temp.serviceImageAtt =  pic_cache.cache(temp.serviceImageAtt);
                            }
                            catch (e){
                                console.log(e);
                            }
                            resObj[resObj.length] = temp;
                        })
                        res.render('seek-class-service',{
                            the_type:"四海服务",
                            new_items:2,
                            class_name:area_class.classify.get_name_by_id(req.query.class),
                            type_id :"service",
                            items:resObj
                        })
                    }
                    else{
                        res.render('seek-class-service', {
                            the_type:"四海服务",
                            new_items:2,
                            class_name:area_class.classify.get_name_by_id(req.query.class),
                            type_id :"service",
                            items:[

                            ]
                        })
                    }
                })
            },
            info:function(req,res){
                seek.info("service",req.query.id,function(result){
                    try{
                       var  resObj = JSON.parse(result);
                        try{
                            var uri = resObj.serviceImageAtt.match(/service\/[\s\S]+/)[0];
                            if(!resObj.serviceImageAtt.match(/files\//)){
                                uri = "files/" + uri;
                            }
                            resObj.serviceImageAtt = pic_cache.cache(resObj.serviceImageAtt);
                        }
                        catch (e){
                            console.log(e);
                        }
                        resObj.servDes = html_decode(resObj.servDes);
                        res.render('detail-service',resObj);
                    }
                    catch (e){
                        console.log(e);
                        res.send(404);
                    }

                })
            },
            des:function(req,res){
                seek.info("service",req.query.id,function(result){
                    try{
                        try{
                            var  resObj = JSON.parse(result);
                        }
                        catch (e){
                            console.log(e);
                            var resObj = result;
                        }
                        try{

                            resObj.serviceImageAtt = pic_cache.cache( resObj.serviceImageAtt);
                        }
                        catch (e){
                            console.log(e);
                        }
                        resObj.servDes = html_decode(resObj.servDes);
                        res.render('detail-service-des',resObj);
                    }
                    catch (e){
                        console.log(e);
                        res.send(404);
                    }

                })
            },
            page_class: function(req,res){
                seek.seek.service(req.query.class,req.query.page,req.query.orderfield,function(result){
                    res.send(result);
                })
            },
            collect:function(req,res){
                seek.collet(req.query.id,req.session.openid,"service",function(result){
                                res.send(result);
                })
            } ,
            is_collect:function(req,res){
                seek.is_collect(req.query.id,req.session.openid,"service",function(result){
                    res.send(result);
                })
            },
            set_session:the_session.set_session
        }
    }

    function requires(){
        var classify = area_class.classify.get();
        var the_session = new set_session("/web/seek/require/index","/seek/require/fromwe");
        console.log(the_session);
        return{
            index:function(req,res) {
                if(req.session.openid)
                    seek.seek.require("1","1","",function(result){
                    var resObj = [];

                    /*
                     *给的根本不是json
                     */
                    if(result.code == 0){
                        result.lst.forEach(function(value){
                            var temp = {};
                            temp  =  JSON.parse(value)
                            try{
                                temp.requireImageAtt = pic_cache.cache(temp.requireImageAtt);
                            }
                            catch (e){
                                console.log(e);
                            }
                            resObj[resObj.length] = temp;
                        })
                        res.render('seek-require',{
                            the_type:"四海需求",
                            new_items:2,
                            type_id :"require",
                            items:resObj
                        })
                    }
                    else{
                        res.render('seek', {
                            the_type:"四海需求",
                            new_items:2,
                            type_id :"require",
                            items:[

                            ]
                        })
                    }
                })
                else{
                    console.log("aa");
                    the_session.force(req,res);
                }

            },
            the_class: function(req,res){
                res.render("seek_class",{
                    type:"需求",
                    type_id :"require",
                    classify: classify
                })

            },
            class_info:function(req,res) {

                seek.seek.require(req.query.class,"1",req.query.orderfield,function(result){
                    console.log(result);
                    var resObj = [];
                    var temp = {};
                    /*
                     *给的根本不是json
                     */
                    if(result.code == 0){
                        result.lst.forEach(function(value){
                            temp  =  JSON.parse(value);
                            try{
                                temp.requireImageAtt =pic_cache.cache(temp.requireImageAtt);
                            }
                            catch (e){
                                console.log(e);
                            }
                            resObj[resObj.length] = temp;
                        })
                        console.log("a");
                        res.render('seek-class-require',{
                            the_type:"四海需求",
                            new_items:2,
                            type_id :"require",
                            class_name:area_class.classify.get_name_by_id(req.query.class),
                            items:resObj
                        })
                    }
                    else{
                        res.render('seek-class-require', {
                            the_type:"四海需求",
                            new_items:2,
                            type_id :"require",
                            class_name:area_class.classify.get_name_by_id(req.query.class),
                            items:[

                            ]
                        })
                    }
                })

            },
            info:function(req,res){
                seek.info("require",req.query.id,function(result){
                   var resObj = result;
                    try{
                        resObj = JSON.parse(result);
                        resObj.releaseTime = new Date(resObj.releaseTime).Format("20yy年MM月dd日 hh:mm:ss");
                        resObj.requireFinishTime = new Date(resObj.requireFinishTime).Format("20yy年MM月dd日 hh:mm:ss");
                        resObj.requireDes = html_decode( resObj.requireDes) ;
                        resObj.requireAddress = resObj.requireAddress||" ";
                        resObj.apllayMaxNum = resObj.apllayMaxNum ||"";
                        res.render('detail-require',resObj);
                    }
                    catch (e){
                        console.log(e);
                        res.send(404);
                    }



                })

            },
            page_class: function(req,res){

                seek.seek.require(req.query.class,req.query.page,req.query.orderfield,function(result){
                    res.send(result);
                })
            },
            collect: function(req,res){
            seek.collet(req.query.id,req.session.openid,"require",function(result){
                res.send(result);
            })
            },
            is_collect: function(req,res){
                seek.is_collect(req.query.id,req.session.openid,"require",function(result){
                    res.send(result);
                })
            },
            set_session:the_session.set_session

        }
    }
    return{
        require:requires(),
        service:service(),
        wrequire:wrequire(),
        game:game(),
        wservice:wservice()
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
    function order(req,res){

        (function(){
            var noteReady = new EventEmitter();
            var  render_obj = {};
            var count = 0;
            for(var value in orders.get_order_list){
                (function(){
                    var value1 = value;
                    orders.get_order_list[value1](req.query.openid,1,function(result1){
                        if(result1.code == '0'){
                            var temp = [];
                            var temp1 ={};
                            result1.ordeList.forEach(function(values){
                                temp1 = JSON.parse(values);

                                temp[temp.length] = temp1;
                            });
                            render_obj[value1]= temp;
                        }
                        else{
                            render_obj[value1]= [];
                        }
                        noteReady.emit("ready");

                    });
                })();
            }
            noteReady.on("ready",function(){
                count +=1;
                if(count == 10){
                    console.log(render_obj);
                    res.send(render_obj);
                    count = 0;
                }

            })
        }) ();

    }
    return {
        user_info :user_info,
        order:order

    }
})();


/*
*用户登录
 */
exports.login = function(req,res){
    var body = req.body;
    console.log(req.session.openid);
     userInfo.login(req.session.openid,body.password,body.username,function(result){
         switch (result){
             case '0':
                 res.redirect("/user/login_success.html");
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
    var username = decodeURI(req.query.username);
    userInfo.check_nick(username,function(result){
         switch (result){
             case '0':
                 req.session.username = username;
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
                req.session.mobile = phone_number;
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
    console.log(body);
    userInfo.register(req.session.openid,req.session.username,body.password,req.session.mobile,function(result){
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
    res.redirect("/user/hire_success.html");
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

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


function html_decode(str)
{
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br>/g, "\n");
    return s;
}