
const { create } = require("express-handlebars");
//const geoip = require('geoip-lite');
const fcn = require('../lib/functions');
const clor = require('colors');
// const pool = require("../database");
// const str_query = require('../lib/nomina/query');
const mysql = require('mysql');
// const { greyscale } = require("jimp");
const moment = require('moment');

// const fcnNom = require('../lib/nomina/fcns');
const { sleep, objecGroup } = require("../lib/functions");
// const stock = require('../controllers/nomina/default_stock').f;
// const util = require('../controllers/nomina/util');

// Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// ... in random order
colors.sort(function (a, b) { return Math.random() > 0.5; });

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + s4();
};

let history = [];
//let listClient = { ip: '0.0.0.0', cliente: { id: '0.0.0.1', fecha: '12-2-12', color: 'ninguno' } };
let listClient = {};

let clientesReconocidos = {
    'clientes': [
        { 'id': 'c#', 'key': 'carse' },
        { 'id': 'nav', 'key': '7f4' }
    ]
};

const validarTipoCliente = ([id_, key_]) => {
    let exist = false;
    for (let [key, cliente] of Object.entries(clientesReconocidos.clientes)) {
        if (cliente.id == id_ && cliente.key == key_) {
            exist = true;
        }
    }
    return exist;
}

const send = (ws, data, convertJSON = 1) => {
    if (convertJSON == 1) { ws.send(JSON.stringify(data)); }
    else { ws.send(data); }
}

const conectados = () => Object.entries(listClient).reduce((counter, obj) => {
    var k = obj[1].tipo; //console.log(` - ${k} - -`);
    let st = obj[1].estado;
    if (!counter[k]) {
        counter[k] = Object.create({}, {});
        counter[k].on = 0;
        counter[k].off = 0;
        if (st == 1) { counter[k].on = 1; } else { counter[k].off = 0 }
    } else {
        if (st == 1) { counter[k].on += 1; } else { counter[k].off += 1; }
    }
    return counter;
}, {}); // 6

const existWS = (ws) => {
    let ews = false;
    for (let [id, cliente] of Object.entries(listClient)) {
        if (ws == cliente.side.serv.socket) {
            // console.log(`y - ${id}`);
            ews = true;
            break;
        }
    }
    return ews;
}

const existIdClient = (id_w) => {
    let eid = false;
    for (let [id, obj] of Object.entries(listClient)) {
        if (id_w == id) {
            eid = true;
            break;
        }
    }
    return eid;
}

const agNvoClient = (ni, ip_c, ws, data, headers) => {
    listClient[ni] = new Object({
        ip: ip_c,
        tipo: data.tipo,
        estado: 1,
        off: 0,
        side:
        {
            serv: {
                socket: ws,
            },
            client: {
                id: ni,
                fecha: Date.now(),
                color: "#" + ((1 << 24) * Math.random() | 0).toString(16),
                headers: headers
            }
        }
    });
}

const actClient = (ni, ws, headers) => {
    listClient[ni].estado = 1;
    listClient[ni].off = 0;
    listClient[ni].side.serv.socket = ws;
    listClient[ni].side.client.headers = headers;
}

const registrarWS = (ip_c, ws, data, descrip, headers) => {
    let ni = getUniqueID();
    // data.hasOwnProperty('id') ? ni = data.id : ni = getUniqueID();

    if (validarTipoCliente([data.tipo, data.key])) {
        if (!existWS(ws)) {
            agNvoClient(ni, ip_c, ws, data, headers)
        }

        console.table(listClient);
        // console.table(listClient.side);

        switch (data.tipo) {
            case 'c#':
                send(ws, { tipo: 'confirm', mensaje: 'bienvenido c#', cliente: listClient[ni].side.client });
                break;
            case 'nav':
                send(ws, { tipo: descrip, mensaje: 'bienvenido nav', cliente: listClient[ni].side.client });
                break;
            default: break;
        }
    }
}

const remAntig = () => {
    for (let [id, ob] of Object.entries(listClient)) {
        if (ob.estado == 0) {
            ob.off = Date.now() - ob.side.client.fecha;
        }
        //eliminar >15000
        if (ob.off > 15000) { delete listClient[id]; }
    }

}

const apagarCliente = (ws) => {
    for (let [id, ob] of Object.entries(listClient)) {
        if (ws == ob.side.serv.socket) {  //   delete listClient[id];
            ob.estado = 0;
            ews = true;
            break;
        }
    }
}

const sendAllClientsConect = (clients, data) => {
    Object.entries(clients).forEach(async cliente => {
        if (cliente[1].estado == 1) { //conectados.
            send(cliente[1].side.serv.socket, data);
        }
    });
}

const generarTablaHTML = (obj, ind = true, id = '', clase = 'table display') => {
    let str = ``; let row = '';
    let head = '<thead><tr>';
    let enc = false;
    for (let [id, ob] of Object.entries(obj)) {
        //encabezados
        if (!enc) {
            ind ? head += `<th>index</th>` : null;
            for (let [id2, ob2] of Object.entries(ob)) {
                head += ` <th>${id2}</th>`;
            }
            enc = true;
        }
        row += `<tr>`;
        ind ? row += `<td>${id}</td>` : null;
        for (let [id2, ob2] of Object.entries(ob)) {
            row += `<td>${ob2 != null ? ob2 : ''}</td>`;
        }
        row += `</tr>`;
    }
    head += '</tr></thead>';
    str += `<table id='tb_${id}' class='${clase}'>${head}<tbody>${row}</tbody></table>`;
    return str;
}


module.exports = async (ws, request, ip_c) => {
    //  fcn.log(clor.green( app.get('port')));
    remAntig();
    ws.on('close', () => { apagarCliente(ws); })

    try {
        ws.on('message', async function message(msg) {

            let data = JSON.parse(msg);
            // fcn.log(clor.red(data));
            switch (data.metodo) {

                case 'registro':
                    registrarWS(ip_c, ws, data, 'registro', request.headers);
                    break;

                case 're-conn':
                    // console.log(data);
                    if (!existIdClient(data.id)) {
                        registrarWS(ip_c, ws, data, 're-asignado', request.headers);
                    } else {
                        actClient(data.id, ws);
                    }
                    break;

                case 'fast':
                    Object.entries(listClient).forEach(async cliente => {
                        if (cliente[1].estado == 1) {
                            send(cliente[1].side.serv.socket, { origen: 'data_from_c#', data });
                        }
                    });
                    break;

                case 'appSync':
                    //  status nom
                    try {
                        let PromAll= await Promise.all([
                         stock.newload('empleados_excluidos', mysql.format(str_query.empleados_excluidos_nom()), '', '', 'stat_nom'),
                         stock.newload('bonos', mysql.format(str_query.bonos_sem()), '', '', 'stat_nom'),
                         stock.newload('descuentos', mysql.format(str_query.obtener_descrip_clave(), ['%[descuento]%']), '', '', 'stat_nom'),
                         stock.newload('empleados_duplicados', mysql.format(str_query.obtenerDuplicados()), '', '', 'stat_nom'),
                         stock.newload('jornales_imp_desglosado',mysql.format(str_query.jornales_desgl_imp()),'')
                      ]);
                    
                        // console.log(clor.bgGreen(fcn.arrays_.groupByKey(global['stock_times'],'name')));
                       
                    //    preparar grafica =============================================
                        let tst=fcn.arrays_.groupByKey(global['stock_times'],'name');
                         data['stat_nom_times']= tst.reduce((b, ac) => {
                            let color="#" + ((1 << 24) * Math.random() | 0).toString(16);
                            let d = {
                                borderColor:color ,
                                borderWidth: 1,
                                data: [{ x: 12, y: 2 }, { x: 3, y: 3 }],
                                label: 'Large Dataset',
                                backgroundColor:color
                                // radios: 0,
                            };
                            d.label = Object.keys(ac).reduce((a, b) => b);
                            d.data = ac[d.label].data.map(e => ({ x: e.ini, y: e.seg }));
                            b.push(d);
                            return b;
                        }, []);
                        
                   
 
                        let f = global.stock.filter(o => o.clase === 'stat_nom');
                        data['stat_nom'] = [];
                        f.forEach(e => {
                            data['stat_nom'].push(util.offcanvas(e.name, e.data));
                        });
                        // fcn.log(clor.magenta(data.stat_nom));
                        sendAllClientsConect(listClient, { origen: 'c#: stat_nom', data });

                    } catch (error) {
                        fcn.log(clor.red(error));
                    }
                    //-------------
                    await stock.newload('destajos_mensual', mysql.format(str_query.estado_destajos_mensual()), '');
                    data = await fcnNom.obtenerDestajos_mensual(data);
                    sendAllClientsConect(listClient, { origen: 'data_from_c', data });

                    break;

                case 'mensaje':

                    fcn.isObj(data.data_Obj) ? data['data_html'] = generarTablaHTML(data.data_Obj, data.data_name) : null;
                    fcn.isObj(data.dt_import1) ? data['dt_import1_html'] = generarTablaHTML(data.dt_import1) : null;
                    fcn.isObj(data.dt_import2) ? data['dt_import2_html'] = generarTablaHTML(data.dt_import2) : null;

                    let dt0 = await fcnNom.datosGraf(data);
                    dt0 != null ? data = dt0 : null; data = await fcnNom.datosGraf(data);

                    Object.entries(listClient).forEach(async cliente => {
                        if (cliente[1].estado == 1) {
                            //conectados.
                            send(cliente[1].side.serv.socket,
                                { origen: 'data_from_c#', data });
                            // {metodo:'data_from_c#',tabla:generarTablaHTML(data.data)});
                        }
                    });

                    break;

                case 'req':
                    switch (data.objetivo) {

                        case 'stat_nom':
                            // fcn.log(clor.bgCyan(data));
                            try {
                                let f = global.stock.filter(o => o.clase === 'stat_nom');
                                data['stat_nom'] = [];
                                f.forEach(e => {
                                    data['stat_nom'].push(util.offcanvas(e.name, e.data));
                                });
                                sendAllClientsConect(listClient, { origen: 'resp: stat_nom', data });
                            } catch (error) {
                                fcn.log(clor.red(error));
                            }

                            break;
                        case 'grf_jorn':
                            // data = await fcnNom.datosGraf(data);
                            let dt0 = await fcnNom.datosGraf(data);
                            dt0 != null ? data = dt0 : null;

                            Object.entries(listClient).forEach(async cliente => {
                                if (cliente[0] == data.id && cliente[1].estado == 1) {
                                    send(cliente[1].side.serv.socket, { origen: 'data_res', data });
                                }
                            });
                            break;
                        case 'grf_anual':
                            let dt = await fcnNom.datosGraf_anual(data);
                            dt != null ? data = dt : null;
                            // fcn.log(data);
                            Object.entries(listClient).forEach(async cliente => {
                                if (cliente[0] == data.id && cliente[1].estado == 1) {
                                    send(cliente[1].side.serv.socket, { origen: 'data_res', data });
                                }
                            });
                            break;
                        case 'cont_asistencia':
                            //   data=await fcnNom.obtenerAsistencia(data);
                            let dt1 = await fcnNom.obtenerAsistencia(data);
                            dt1 != null ? data = dt1 : null;
                            //  fcn.log(oj);
                            Object.entries(listClient).forEach(async cliente => {
                                if (cliente[0] == data.id && cliente[1].estado == 1) {
                                    send(cliente[1].side.serv.socket, { origen: 'data_res_tabla_asist', data });
                                }
                            });

                            break;

                        case 'destajos_mensual':
                            //   data=await fcnNom.obtenerAsistencia(data);
                            await sleep(3000);
                            let dt10 = await fcnNom.obtenerDestajos_mensual(data);
                            dt10 != null ? data = dt10 : null;
                            //    fcn.log(clor.red(dt10));
                            Object.entries(listClient).forEach(async cliente => {
                                if (cliente[0] == data.id && cliente[1].estado == 1) {
                                    send(cliente[1].side.serv.socket, { origen: 'data_res:destajos_mensual', data });
                                }
                            });

                            break;

                        default:
                            break;
                    }

                    // ids dinamicos ********
                    if (data.objetivo.startsWith('idj_'))
                    {
                        // fcn.log(clor.bgCyan(data.objetivo));
                    let dt = fcnNom.obtenerDetallesJorn(data);
                    dt != null ? data = dt : null;
                    Object.entries(listClient).forEach(async cliente => {
                        if (cliente[0] == data.id && cliente[1].estado == 1) {
                            send(cliente[1].side.serv.socket, { origen: 'jornDetail', data });
                        }
                    });
                }
                    // **********************

                    break;

                default:
                    send(ws, `Metodo desconocido.. IP:${ip_c}`);
                    ws.close()
                    break;
            }

            // console.table(conectados());
            //  console.table(listClient);
            let tb_conn = conectados();
            process.env.client_sockets = listClient;
            //enviar a cleintes activos
            Object.entries(listClient).forEach(cliente => {
                if (cliente[1].estado == 1) {
                    //conectados.
                    //   send(cliente[1].side.serv.socket,
                    //      {metodo:'client-conn',tabla:generarTablaHTML(tb_conn)});

                }
            });

            // console.table(tb_conn);
        });
    } catch (error) {
        console.error(' == error de proceso msj-client ' + error);
    }

}