const procs = {};
const fcn = require('../lib/functions');
const mysql = require('mysql');
const pool = require('../database');
const { tablas } = require('../lib/tablas');
const moment = require('moment');

procs.url_process = async (req) => {
   let r = {};
   //consulta tablas ------------
   switch (req.method) {

      case 'GET':
         if (fcn.isObj(req, 'query', 'a') && fcn.isObj(req, 'query', 't')) {  // [t,a]

            if (fcn.isObj(req, 'query', 'id')) {
               // eliminar 
               r = await procs.accionBD(req, r);
               console.log('-del-');
            }
         }
         break;

      case 'POST':
         if (fcn.isObj(req, 'body', 'form_type')) { // editar
            console.log('-edit-');
            r = await procs.procesar_form(req, r);
            // console.log(r);
            // r['msg'].redirect = req.originalUrl;
         }

         break;

      default:
         break;
   }

   //  r = { ...r, ['rs']: await procs.consultaTabla(req) };
   r = await procs.consultaTabla(req, r);

   return r;

}

procs.getOrder = async (req, rs) => {
   let strsql; let r;
   strsql = mysql.format(`SELECT * FROM ordenes WHERE user=? ORDER BY timestamp desc`, [req.user.id]);
   r = await pool.queryFull(strsql);
   r.rows = fcn.obj_filtrar_keys(fcn.fusionarObjectsArr(r.rows, null, tablas.ordenes.add_edit[1], null, null), ['user'], false, 1);
   return r;
}


procs.procesar_form = async (req, rs) => {
   let msg = {}; let selProd; let delProd; let insr; let tb; let tb_q;
   rs = { ...rs, ['msg']: 'resolviendo..edit form' }
   fcn.isObj(req, 'body', 'dest') ? tb = req.body.dest : tb = null;
   fcn.isObj(req, 'query', 't') ? tb_q = req.query.t : tb_q = null;
   switch (req.body.form_type) {
      case 'frm_edit':
         insr = { ...fcn.campos_for_ejec_query(req), ...{ timestamp: moment().format('yyyy-MM-DD HH:mm:ss') } };
         insr = fcn.obj_filtrar_keys(insr, tablas[tb].procs_form, false, 2);
         // fcn.log(tb,insr);
         selProd = await pool.queryFull(mysql.format(`UPDATE ${tb} SET ? WHERE id=?`, [insr, req.body.id]));
         rs = { ...rs, ['msg']: selProd }
         rs['msg'].redirect = req.originalUrl;
         return rs;
     
      case 'frm_add':
         insr = { ...fcn.campos_for_ejec_query(req), ...{ timestamp: moment().format('yyyy-MM-DD HH:mm:ss') } };

         let sql = mysql.format(`INSERT INTO ?? SET ?`, [req.query.t, insr]);

         switch (tb_q) {
            case 'ordenes':
               insertar = await pool.queryFull(sql);
               rs = { ...rs, ['msg']: insertar }
               rs['msg'].redirect = req.originalUrl;
               return rs;

            default:
               break;
         }

         break;

      default:
         break;
   }
}

procs.consultaTabla = async (req, rs) => {
   let strsql = '';
   try {
      let r = null;

      if (fcn.isObj(req, 'query', 't')) {
         tb = req.query.t;
      } else {
         r = await procs.getOrder(req, rs);
         return { ...rs, ['rs']: r, ['rsl']: r };
      }

      switch (tb.toLowerCase()) {
         case 'ordenes':
            r = await procs.getOrder(req, rs); rs = { ...rs, ['rs']: r, ['rsl']: r };
            if (fcn.isObj(req, 'query', 'id') && req.query.a == 'view') {
               strsql = mysql.format(`SELECT 
                                       p.*  
                                       FROM productos p
                                       LEFT JOIN ordenes o on o.id=p.id_orden
                                       WHERE  o.USER = ? and o.id=?
                                       ORDER BY timestamp desc`, [req.user.id, req.query.id]);

               r = await pool.queryFull(strsql);
               r.rows = fcn.obj_filtrar_keys(fcn.fusionarObjectsArr(r.rows, tablas.productos.add_edit[0], tablas.productos.add_edit[1], null, null), ['byte'], false, 1);
            }

            return { ...rs, ['rs']: r };


         case 'productos':
         // // --- lista ------
         // r = await procs.getOrder(req,rs); rs = { ...rs, ['rsl']:r };
         // // --- datos ------
         // strsql = mysql.format(`SELECT 
         // p.*  
         //                         FROM ?? p
         //                         LEFT JOIN ordenes o on o.id=p.id_orden
         //                         WHERE  o.USER = ? order by timestamp desc, p.id_orden desc`, [tb, req.user.id]);


         // if (fcn.prop_exis(req.query.id) && req.query.a == 'view') {
         //    strsql = mysql.format(`SELECT 
         //                            p.*  
         //                            FROM ?? p
         //                            LEFT JOIN ordenes o on o.id=p.id_orden
         //                            WHERE  o.USER = ? and o.id=?
         //                            ORDER BY timestamp desc, p.id_orden desc`, [tb, req.user.id, req.query.id]);
         // }

         // r = await pool.queryFull(strsql);
         // r.rows = fcn.obj_filtrar_keys(fcn.fusionarObjectsArr(r.rows, tablas.productos.add_edit[0], tablas.productos.add_edit[1], null, null), ['byte'], false, 1);
         // return { ...rs, ['rs']: r };

         default:
            // strsql = mysql.format(`SELECT * FROM ??`, [tb]);
            //  r = pool.queryFull(strsql);
            //  return  { ...rs, ['rs']: r, ['rsl']: r };
            
      }


   } catch (e) {
      console.error(e);
      return null;
   }
}

procs.accionBD = async (req,rs) => {
   try{
   rs = { ...rs, ['msg']: 'resolviendo..'}
   let msg = { type: 'warning' };
   switch (req.query.a) {
      case 'delete':
         switch (req.query.t) {
            case 'productos':

               selProd = await pool.queryFull(mysql.format(`SELECT p.* FROM productos p 
                                                             LEFT JOIN ordenes o on o.id=p.id_orden
                                                             WHERE 
                                                             p.id=? 
                                                             and o.user=? 
                                                             ORDER BY timestamp desc`, [req.query.id, req.user.id]));

                                                             fcn.log('entro ...',rs,selProd)

               if (selProd.rows != null) {
                  rs.msg['thmb'] = fcn.eliminarFiles(selProd.rows, 'src/public/disck/', '_th.jpeg');
                  delProd = await pool.queryFull(mysql.format(`DELETE FROM productos Where id=?`, req.query.id));
                  rs.msg['status'] = delProd.rows;
                  req.flash('success', 'Eliminado');
                  rs['msg'].redirect = req.originalUrl;
               } else {
                  rs.msg['status'] = 'Sin registro.!';
               }
               break;

            case 'ordenes':

               selProd = await pool.queryFull(mysql.format(`SELECT p.* FROM productos p 
                                                               LEFT JOIN ordenes o on o.id=p.id_orden
                                                               WHERE
                                                                  o.user=? 
                                                                  and p.id_orden=?
                                                               ORDER BY 
                                                                    timestamp desc`, [req.user.id, req.query.id]));

               if (selProd.rows != null) {
                  rs.msg['thmb'] += fcn.eliminarFiles(selProd.rows, 'src/public/disck/', '_th.jpeg');
                  // console.log(req.query);
                  delProd = await pool.queryFull(mysql.format(`DELETE FROM productos Where id_orden=?`, req.query.id));
                  
                  rs.msg['status'] = delProd.rows;
                  const delOrd = await pool.queryFull(mysql.format(`DELETE FROM ordenes Where id=? and user=?`, [req.query.id, req.user.id]));
                  rs.msg[1] += delOrd;
                  req.flash('success', 'Eliminado');
                  rs.rs['msg'].redirect = req.originalUrl;
               } else {
                  msg['status'] = 'Sin registro.!';
               }

               break;
            default:
               break;
         }
         break;

      default:
         break;
   }
}catch(e){
   rs = { ...rs, ['error']: e}
}
   return rs;
}


module.exports = procs;