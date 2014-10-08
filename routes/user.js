/* GET users listing. */
exports.list = function(req, res){
  res.send('respond with a resource');
};
exports.util = function(req,res){
    res.render('util',{});
}
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

exports.seek = function(req,res){
    res.render('seek',{
        new_items:10,
        services:[]
    })
}
