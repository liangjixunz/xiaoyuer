/* GET home page. */
exports.index = function(req, res){
  res.render('index', { title: "您好" });
};
exports.admin = require("./admin");
exports.user = require("./user");
exports.event = require("./event");
