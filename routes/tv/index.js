const express = require('express');
const router = express.Router();
// const moment = require('moment');
const fcn = require('../../lib/functions');

const browserObject = require('../../x_scraping/browser');
const scrap = require('../../x_scraping/cuevana/pageScraper');

const Axios = require('Axios');

let mysql = require('mysql');
const conn = require('../../db_custom')({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'iptv'
})

const fcn_ = require('../tv/fcn_');

router.get('/stream', async (req, res) => {
    
	let list_movies = undefined;
    let { p, genero,ofs} = req.query;
	ofs==undefined?ofs=50:null;

	let categorias = await conn.queryFull(`SELECT l.genero FROM links l  GROUP BY l.genero`);
	let cat_0 = fcn_.f.categorias(categorias.rows);

	cat_0 = cat_0.obj;
    let generoq=genero==undefined?'%':`%${genero}%`;
	let query0=`SELECT *  FROM links l WHERE l.genero like ?`;
	let list0 = await conn.queryFull(mysql.format(query0, [generoq]));
	let list = await conn.queryFull(mysql.format(`SELECT *  FROM links l
	WHERE
	l.genero like ?
	ORDER BY
	l.estreno desc,
	l.calificacion desc,
	l.titulo  LIMIT ${ofs} OFFSET ${p==undefined?0:(p-1)*ofs} `, [generoq]))
	list.rows.length > 0 ? list_movies = list.rows : null;

	// console.log(cat_0);
	let paginacion = fcn_.f.paginacion(p, list0.rows.length,ofs); // console.log(paginacion);
	res.render('movies/index', { cat_0, list_movies, genero, paginacion ,ofs });

});

router.get('/', async (req, res) => {
	let list = `#EXTM3U x-tvg-url="http://sycrs.ddns.net:3000/iptvlist\n";
    `;
	let host = `http://192.168.0.4:3000/iptvlist/`;
	// let host = `http://172.16.2.31:3000/iptvlist/`;
	let stmt = ['', 2];

	if (req.query.hasOwnProperty('g') && req.query.hasOwnProperty('e')) {
		let { g, e } = req.query;
		e != '' && g != '' ? stmt = [`select * from links where genero like ? and estreno = ?`, [g, e]] : null;
	} else if (req.query.hasOwnProperty('g')) {
		let { g } = req.query;
		g != '' ? stmt = [`select * from links where genero like ? and estreno = ?`, [g, e]] : null;
	}

	await conn.query(stmt[0], stmt[1], function (error, results, fields) {
		if (error) { return console.error('error!'); }
		results.forEach(i => {
			// list += `\n#EXTINF:-1 tvg-logo="${i.src}" group-title="${i.genero}", ${i.titulo}
			// ${host}link?id=${i.id}`;
			list += `#EXTINF:-1 tvg-logo="${host}image?id=${i.id}" group-title="${i.genero}", ${i.titulo}\n${host}test?id=${i.id}\n\n`;
		});
		res.set('Content-Type', 'text/plain');
		console.log(list);
		res.send(list);
	});


});

router.get('/image', async (req, res) => {
	if (req.query.hasOwnProperty('id')) {
		let { id } = req.query;
		if (id != '') {
			await conn.query(`select l.src from links l where id=? `, [id], function (error, results, fields) {
				if (error) { return console.error('error!'); }
				console.log(results[0].src);
				res.redirect(results[0].src);
				// res.send('results[0]');
			});
		} else {
			res.send('no encontrado');
		}

	}
});

router.get('/test', async (req, res) => {
	console.log(`require!  id = ${req.query.id}`);
	// let recurso = `https://fvs.io/redirector?token=V0hiM2c2OG8wNkpVQ0t5TXVHQWhuLzN5Z0V1UE0rdW5JZGd6R0hZRWJMZ0pvMU1QdW4vZjlhU05TRUY1ZjZQYStoTEducGJTZ1cxSzV5OWxBZFpKcHVmdGF5cmNTSktpWDBiRFNLY3pRYU0vMU5kVi9oMTNYOGlleXFrYnBCUU51aVZuaUNlS1h5VmZ5cWZqME9OMTFieHc2SEk5cWc9PTpRSlQ2K0hhbGhqcHVIUHpFNlFjOEFBPT0lIZy`;


	// res.render('movies/streams',{recurso});
});

router.get('/link', async (req, res) => {
	if (req.query.hasOwnProperty('id')) {
		let { id,int } = req.query;
		let {originalUrl}= req;
		let u = ``;
		let rs = null;
		let recurso;
	    int==undefined?int=0:int=parseInt(int);

		if (id != '') {
			let rs = await conn.queryFull(mysql.format(`select l.id, l.url,l.enlace_movie from links l where id=? `, [id]));
			// console.log(rs.rows);
			if (rs.rows.length > 0) {

				let { id, url, enlace_movie } = rs.rows[0];
                recurso=enlace_movie!=null?enlace_movie:undefined;
         
                let enlace_p= await fcn_.probar_enlace(recurso);
                if (enlace_p) {
				    res.render('movies/streams', { recurso })
					return
				}

				u = url;
				let browser;

				// reiniciar ---------
				try {
					(async () => {
						await fcn.sleep(15000);
						await browser.close();
						try {
							if(int<8){
								res.redirect(originalUrl.replace(/&int=\d+/gi, '') + '&int=' + (int + 1));
							} else{
								res.sendStatus(404);
							}
						} catch (error) {
							// console.log(error);
						}
					})()
				} catch (error) { }
				// --------------------
				try {

					browser = await browserObject.startBrowser();
					let page = await browser.newPage();

					let ru = await scrap.cuevana.get_goto_ir(u, page);

					await page.goto(ru, { 'waitUntil': 'networkidle0' });

					let t = '';

					await page.on('response', response => {
						let r = String(response.headers()['location']);
						console.log(r);
						if (r.includes('#')) {
							r = r.split('#');
							console.log(r);
							t = `https://tomatomatela.com/details.php?v=${r[1]}`;
							Axios
								.get(t)
								.then(async res2 => {
									recurso = res2.data.file;
									if (res2.data.status == 200) {
										let ins = await conn.queryFull(mysql.format(`UPDATE links SET enlace_movie=? WHERE id=?`, [recurso, id]));
										console.log(ins);
										await browser.close();
										res.render('movies/streams', { recurso });
									}
								})
								.catch(Error => {
									// console.error(Error);
								});

						} else { }
					});


					// console.log('espero hasta!!');



					if (t != '') {
						console.log(t);
					}

				} catch  (err) {
					console.log(err);
					try {
					await browser.close();
					} catch (error) {

					}
				}
			}

		}
	}
})

module.exports = router; 