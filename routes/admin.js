var db = require("xiaoyuer/gift/db");

exports.new_event = function(req,res){
    console.log(req.body);
    db.add_event(req.body,function(result){
        res.send(result);
    })
} ;

exports.event_forwarding_info = function(req,res){
    db.get_forwarding_info(req.query.event_id,function(result){
        res.render("forwarding_statics",{
            info:{
                event_forwarding:123,
                event_balance:2222
            },
            statics:(result ? result : [])
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
         ;
    })
}

exports.event_index = function(req,res){
    db.get_event_index(function(result){
        res.render("event_list",{
            total_time:3,
            total_award:3243.4,
            event_list:result
        })
    })
}

exports.event_total = function(req,res){

}


/*
*微信自动回复的设置
 */

