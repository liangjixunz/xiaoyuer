/* GET home page. */
exports.index = function(req, res){
  res.render('index', { title: "您好" });
};
exports.admin = require("./admin");
exports.event = require("./event");
exports.user = require("./user");