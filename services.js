var jwt = require("jwt-simple");
var moment = require("moment");
var config = require("./config");

exports.createToken = function () {
  var payload = {
    iat: moment().unix(),
    exp: moment().add(1, "days").unix(),
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
};