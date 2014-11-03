var db = require("xiaoyuer/gift/db"),
    area_class = require("xiaoyuer/area_class"),
    EventEmitter = require('events').EventEmitter;
/*
*创建一个新的活动
 */
exports.new_event = function(req,res){
    console.log(req.body);
    db.new_activity(req.body);
    res.redirect("/web/myadmin/event/index");

} ;
/*
*转发详情
 */
exports.event_forwarding_info = function(req,res){
    db.forwarding_info(req.query.event_id,function(result){
        db.get_activity_info(req.query.event_id,function(result1){
            res.render("forwarding_statics",{
                info:{
                    event_name:result1.event_title,
                    event_forwarding:result ? result.length : 0
                 },
                statics:(result ? result : [])
            })
        })

    })
};

/*
*抽奖结果列表
 */
exports.event_withdraw_info = function(req,res){
    db.lottery_info(function(result){
        console.log(result);
        res.render("withdraw",{
            withdraw_list:result,
            processed:(function(){
                var totals = 0;
                result.forEach(function(value){
                    if(value.withdraw_is_over)
                        totals +=1;
                });
                return totals;
            })(),
            processing:(function(){
                var totals = 0;
                result.forEach(function(value){
                    if(value.withdraw_is_over==0)
                        totals +=1;
                });
                return totals;
            })(),
            total_withdraw:(function(){
                var totals = 0.0;
                result.forEach(function(value){
                        totals += value.money;
                });
                return totals;
            })()
        });
        console.log(result);
    })
};

/*
*活动的描述
 */
exports.event_info = function(req,res){
    db.get_event_info(req.query.event_id,function(result){
        res.send(result);
    })
};
/*
*活动列表
 */
exports.event_index = function(req,res){
    db.get_all_activities(function(result){
        res.render("event_list",{
            total_time:result.length,
            total_award:(function(){
                var totals = 0;
                result.forEach(function(value){
                   totals += value.event_total;
                });
                return totals;
            }
                )(),
            event_list:result
        })
    })
};
/*
*新建奖品
 */
exports.new_award = function(req,res){
    db.new_award(req.body,function(result){
        res.send(result);
    });

};
/*
*设定为已兑奖s
 */
exports.change_recieve = function(req,res){
    db.change_recieve(req.query.id);
    res.send("success");
}
/*
*抽奖流水
 */
exports.lottery_info = function(req,res){
        db.lottery_info(function(result){
            if(result.length){
                var note_ready = new EventEmitter();
                var result1 = [];
                var count = 0;
                note_ready.on("ready",function(){
                    count += 1;
                    if(count == result.length){
                        res.render("lottery_statics",{
                            statics:result1
                        });
                    }
                });
                result.forEach(function(value,index){
                    if(value.is_award){
                        (function(){
                            var _index = index;
                            var temp = value;
                            db.getAwardInfo(value.award_code,function(infos){
                                temp.award_name = infos.award_name;
                                result1[_index] =temp;
                                note_ready.emit("ready");
                            })
                        })()
                    }
                    else{
                        value.award_name = "";
                        result1[index] =value;
                        note_ready.emit("ready");
                    }
                });

            }
            else{
                res.render("lottery_statics",{
                    statics:[]
                });
            }

        })
}
/*
*实物奖品
 */
exports.lottery_real = function(req,res){
    db.lottery_real_info(function(result){
        if(result.length){
            var note_ready = new EventEmitter();
            var result1 = [];
            var count = 0;

            result.forEach(function(value,index){
                    (function(){
                        var _index = index;
                        var temp = value;
                        db.getAwardInfo(value.award_code,function(infos){
                            temp.award_name = infos.award_name;
                            result1[_index] =value;
                            note_ready.emit("ready");
                        })
                    })()


            });
            note_ready.on("ready",function(){
                count += 1;
                if(count== result.length){
                    callback(result1);
                }
            });
        }
        else{
            callback([]);
        }

    })

}
/*
*奖品列表
 */
exports.all_award_list = function(req,res){
    db.get_all_award(function(result){
        res.render("award_list",{
            award_list:result
        })
    })
}
/*
*具体的奖品信息
 */
exports.award_info_detail = function(req,res){
    db.get_award_detail(req.query.id,function(result){
        res.render("award_info",{
            award_list:result
        })
    })
}
exports.event_total = function(req,res){

};
/*
 *微信自动回复的设置
 */
exports.reply_set = function(req,res){
    res.render("auto_reply",{});
};

/*
*更新地区代码表
* @param content
* Method: POST
 */
exports.area_update = function(req,res){
    var content = req.body.content;
        try{
            content=JSON.parse(req.body.content)
        }
    catch (e){
        console.log(e);
    }
    res.send(area_class.area.update(content));
};
/*
 *更新分类表
 * @param content
 * Method: POST
 */
exports.class_update = function(req,res){
    var content = req.body.content;
    try{
        content=JSON.parse(req.body.content)
    }
    catch (e){
        console.log(e);
    }
    res.send(area_class.classify.update(content));
};
/*
*更新公益分类表
 */
exports.welfare_class_update = function(req,res){
    var content = req.body.content;
    try{
        content=JSON.parse(req.body.content)
    }
    catch (e){
        console.log(e);
    }
    res.send(area_class.area.update(content));
};
