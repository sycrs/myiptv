const scrap = require('scrape-it');
const fcn = require('../lib/functions');

module.exports = {
    sms_inbox: () => {
        return scrap("https://receive-sms.com/14108708987", {
            registros: {
                listItem: "#messages-table > tbody > tr",
                data:{
                    from:".td-from",
                    msg:".td-message"
                }
                
            }
        }).then(({ data, response }) => {
            console.log(JSON.stringify({['Status Code']:response.statusCode,['data']:data,code:fcn.genRandom(1)}));
            return {['Status Code']:response.statusCode,['data']:data};

        })
    }
}