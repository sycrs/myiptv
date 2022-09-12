const helpers = {};
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {format} = require('timeago.js');

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helpers.matchpassword = async (password, savePassword) => {
    try {
       return await bcrypt.compare(password, savePassword);
    } catch (e) {
        console.log(e);
    }
}

helpers.timeago=(timestamp)=>{return format(timestamp);}

module.exports = helpers;