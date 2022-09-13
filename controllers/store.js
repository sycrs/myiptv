const fcn = require('../lib/functions');
const mysql = require('mysql');
const pool = require('../database');
const { tablas } = require('../lib/tablas');
const moment = require('moment');
const procs = {};

procs.url_process = async (req, res) => {
    let r = {};
    //consulta tablas ------------
    switch (req.method) {
        case 'GET':
           let act=null;
            if (fcn.isObj(req, 'query', 'a')) {
                fcn.isObj(req, 'query', 'orden')?act=req.query.orden:null;

                req.query.a=='view'&& fcn.isObj(req,'query','orden')? r= await procs.getOrder(req.query.orden,r):null;
            }

           r=await procs.getListOrders(act,r);

            break;
        default:
            break;
    }
    return r;
}

procs.getOrder= async(id,rs)=>{

    strsql = mysql.format(`SELECT 
                                   p.*  
                                   FROM productos p
                                   LEFT JOIN ordenes o on o.id=p.id_orden
                                   WHERE
                                    o.id=?
                                    ORDER BY timestamp desc`, [id]);

    r = await pool.queryFull(strsql);
    r.rows = fcn.obj_filtrar_keys(r.rows, tablas.productos.fields_priv, false, 1);
    return { ...rs, ['gal']: r };
}

procs.getListOrders = async (act_id=null,rs) => {
    let sql = mysql.format(`SELECT
                             COUNT( p.id_producto ) AS cantidad,
                             u.fullname,
                             o.*
                            FROM
                             ordenes o
                            LEFT JOIN productos p ON p.id_orden = o.id
                            LEFT JOIN users u ON u.id = o.USER
                            WHERE 
                             u.publico=1
GROUP BY
  o.id
ORDER BY
  u.fullname,
  o.nombre,
  o.id`);

    let orderSeller = await pool.queryFull(sql);
    act_id!=null? orderSeller.rows = fcn.objAddProp(orderSeller.rows,'class','border border-success shadow bg-success bg-gradient bg-opacity-25',act_id):null;
    orderSeller = fcn.objecGroup(orderSeller.rows, 'fullname');
    rs = { ...rs, ['listOrder']:orderSeller};

    return rs;
}

module.exports = procs;
