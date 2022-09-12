
const browserObject = require('../browser');
let browserInstance = browserObject.startBrowser();
const pageScraper = require('./pageScraper');


let mysql = require('mysql');
let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'iptv'
});

let max=[163,174];

const fcn = require('../../lib/functions');

(async function () {
	let browser;
	try {
		browser = await browserInstance; // let jsn=JSON.stringify( await pageScraper.scraper(browser));	
  
		connection.connect();
        let stmt ='';
        for  (let index = max[0]; index < max[1]+1; index++) {
			let page = await browser.newPage();
            let jsn = await pageScraper.scraper(browser,page,`https://ww1.cuevana3.me/peliculas/page/${index}`);
            // console.log(jsn.data);
			let dains=fcn.objeto_convertir_val_a_array(jsn.data);
			let campos= Object.keys(jsn.data[0]);
			// console.log(campos);
			stmt= `INSERT IGNORE INTO links(${campos})  VALUES ? `;
			await connection.query(stmt,[dains], function (error, results, fields) {
				if (error) {
					return console.error(error.message);
				  }
				  // get inserted rows
				  console.log('Row inserted:' + results.affectedRows);
				
			});

		}

		connection.end(()=>{
          console.log('conxion cerrada!');
		});

		
	}
	catch (err) {
		console.log("Could not resolve the browser instance => ", err);
	}
})();