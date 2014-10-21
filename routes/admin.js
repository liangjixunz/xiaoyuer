var db = require("xiaoyuer/gift/db"),
    area_class = require("xiaoyuer/area_class");
/*
*创建一个新的活动
 */
exports.new_event = function(req,res){
    console.log(req.body);
    db.add_event(req.body,function(result){
        res.redirect("/web/myadmin/event/index");
    })
} ;
/*
*转发详情
 */
exports.event_forwarding_info = function(req,res){
    db.get_forwarding_info(req.query.event_id,function(result){
        db.get_event_moreinfo(req.query.event_id,function(result1){
            res.render("forwarding_statics",{
                info:{
                    event_name:result1.title,
                    event_forwarding:result1.total,
                    event_balance:result1.balance
                },
                statics:(result ? result : [])
            })
        })

    })
}

/*
*转发活动列表
 */
exports.event_withdraw_info = function(req,res){
    db.get_with_draw_index(function(result){
        res.render("withdraw",{
            withdraw_list:result,
            processed:(function(){
                var totals = 0;
                result.forEach(function(value){
                    if(value.withdraw_is_over)
                        totals +=1;
                })
                return totals;
            })(),
            processing:(function(){
                var totals = 0;
                result.forEach(function(value){
                    if(value.withdraw_is_over==0)
                        totals +=1;
                })
                return totals;
            })(),
            total_withdraw:(function(){
                var totals = 0.0;
                result.forEach(function(value){
                        totals += value.money;
                })
                return totals;
            })()
        })
        console.log(result);
    })
}

/*
*活动的描述
 */
exports.event_info = function(req,res){
    db.get_event_info(req.query.event_id,function(result){
        res.send(result);
    })
}
/*
*活动列表
 */
exports.event_index = function(req,res){
    db.get_event_index(function(result){
        res.render("event_list",{
            total_time:result.length,
            total_award:(function(){
                var totals = 0;
                result.forEach(function(value){
                   totals += value.event_total;
                })
                return totals;
            }
                )(),
            event_list:result
        })
    })
}

exports.event_total = function(req,res){

}
/*
 *微信自动回复的设置
 */
exports.reply_set = function(req,res){
    res.render("auto_reply",{});
}

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
}
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
    res.send(area_class.area.update(content));;
}
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
}
