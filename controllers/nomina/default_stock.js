const pool = require('../../database');
const moment = require('moment');
const fcn = require('../../lib/functions');
const clor = require('colors');
const mysql = require('mysql');
const str_query = require('../../lib/nomina/query');

let f = {};

class Precarga {
    constructor(name, data, ini, fin, updating,clase=null) {
        this.name = name;
        this.data = data;
        this.updating = updating;
        this.param = {
            ini: ini,
            fin: fin
        };
        this.clase=clase;
    }
    
}

f.newload = async (nombre, query, ini, fin,clase=null) => { // fcn.log(clor.bgMagenta(query));
    let f = global.stock.find(o => o.name === nombre);
    const start = new Date();
    let tmp = new Precarga(nombre, '', start, fin, true, clase);
    if (f != undefined) { //si  existen datos de array buscado
        if (f.updating) {  // estado actualizando
            fcn.log(clor.cyan(`${nombre} -> Actualizacion rechazada!..`));
            return false;
        } else { // si no esta actualizando
            f.updating = true;
            global.stock = global.stock.map(u => u.name !== nombre ? u : f);
        }
    } else {
        global.stock.push(tmp);
    }
    
    // console.log('nueva qry '+ nombre);
    let o_ = await pool.queryFull(query);
    tmp.data = o_.rows;
    // fcn.log(clor.red(o_.rows));
    tmp.updating = false;
    tmp.param.fin=new Date();
    const end = new Date() - start;
    global.stock = global.stock.map(u => u.name !== nombre ? u : tmp);
    global.stock_times.push({name:nombre,ini:start.getTime(),fin:new Date().getTime(),seg:end / 1000});
    fcn.log(clor.yellow(`${nombre} actualizado!      ${end / 1000} seg.`));
    return tmp;
    // fcn.log(tmp.data);
}

f.sendUpdate=async()=>{

    (async function () {
        await stock.newload('jornales_graf', mysql.format(str_query.jornales(),
            [moment().add(-21, 'days').format('yyyy-MM-DD'), moment().format('yyyy-MM-DD')]), '');
     
    })();
    
    (async function () {await stock.newload('jornales_anual',mysql.format(str_query.comparativo_anual()),'');})();
    
    (async function () {await stock.newload('cont_asistencia',mysql.format(str_query.asistencia( moment().format('yyyy-MM-DD') )),'');})();
    
    (async function () {await stock.newload('destajos_mensual',mysql.format(str_query.estado_destajos_mensual()),'');})();  
    

}


module.exports = {
    f,
    Precarga
}