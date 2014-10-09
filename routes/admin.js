var db = require("xiaoyuer/gift/db");

exports.new_event = function(req,res){
    console.log(req.body);
    db.add_event(req.body,function(result){
        res.redirect("/web/myadmin/event/index");
    })
} ;

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

exports.event_withdraw_info = function(req,res){
    db.get_with_draw_index(function(result){
        res.render("withdraw",{
            withdraw_list:result,
            processed:123,
            processing:23,
            total_withdraw:333.06
        })
    })
}

exports.event_info = function(req,res){
    db.get_event_info(req.query.event_id,function(result){
        res.send(result);
    })
}

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

exports.reply_set = function(req,res){
    res.render("auto_reply",{});
}

/*
*微信自动回复的设置
 */

