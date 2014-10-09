var userInfo = require("xiaoyuer/userInfo")


exports.util = function(req,res){
    res.render('util',{});
}
/*
*获取自己的订单列表
* 利用req.session.openid
 */
exports.order = function(req,res){
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
    userInfo.getOrder(req.query.openid,function(result){
        res.send(result);
    })
}