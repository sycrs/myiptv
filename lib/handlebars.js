const { json } = require('express');
const moment = require('moment');
const helpers = require('../lib/helpers');
const fcn = require('../lib/functions');

const {tablas} = require('../lib/tablas');

moment.locale('es');

const newElements = (o, obj) => {
    //   console.log(o);
    let inp_group = '';
    let s = '';
    for (let [k1, o1] of Object.entries(o)) {

        let o_act = Object.entries(obj.fields).reduce((n, [i, v]) => {
            if (v.name == k1) { n = v };
            return n;
        }, 0);
        //  console.log(o_act,"--");
        //  console.log('_ _');
        //  console.log(k1,o1,o_act);
        switch (o_act.type) {
            case 0:
            case undefined:
                switch (true) {
                    case /imagen/.test(k1):
                        s += `<div class="thumbnail bg-light p-2">
                               <a href="${o.imagen().href}" target="_blank"> 
                                 <img src="${o.imagen().src}" class="${o.imagen().class}" alt="..."> </img>
                                 <b>${o.descripcion}</b>
                               </a>
                              </div>`;
                        break;
                    case /elemento/.test(k1):
                        //   console.log(o_act);
                        o[k1].tag == 'button' ? inp_group += `<button ${fcn.prop_exis(o[k1].fcn) ? o[k1].fcn(o.id) : null} ${fcn.prop_exis(o[k1].extra) ? o[k1].extra : null} type="${o[k1].type}" id="save_${o.id}" class="${o[k1].class}" >${o[k1].value}</button>` : null;
                        break;
                    default:
                        break;
                }
                break;

            default:
                
                let typ = tablas.productos.lectura.filter(i => i == k1).length; 
                // typ == 1 ? o_act.type = 0 : null;
                typ == 0 ? s += `<div class="form-floating p-1">` : null;
                s += `<input ${defXtypeFrm(typ==1? 0 :o_act.type, o1)} name="${k1}" class="form-control" refid="${o.id}" id="floatingInput" placeholder="${k1}">`;
                typ == 0 ? s += `<label for="floatingInput">${k1}</label>` : null;
                typ == 0 ? s += `</div>` : null;
                break;
        }


    }
    inp_group!=''? s+=`<div class="input-group p-2">${inp_group}</div>`:null;
    return s;
}

const defXtypeFrm=(t,valor)=>{
    //  console.log(t,valor);
    switch (t) {
        case 3:   return `type="number" value="${valor}"`;
        case 253: return `type="text"  value="${valor}"`;
        case 5:   return `type="number" step="0.01" value="${valor}"`;
        case 10:  return `type="date"   value="${moment(valor).format('yyyy-MM-DD')}"`;
        case 0 :  return `type="hidden" value="${valor}"`;
        case 12:  return `type="datetime-local"   value="${moment(valor).format('yyyy-MM-DDTHH:mm')}"`;
            
        default:
            break;
    }
}

module.exports = {

    compara: (v1, operador, v2) => {
        switch (operador) {
            case '==':
                return (v1 == v2) ? true : false;
            case '===':
                return (v1 === v2) ? true : false;
            case '!=':
                return (v1 != v2) ? true : false;
            case '!==':
                return (v1 !== v2) ? true : false;
            case '<':
                return (v1 < v2) ? true : false;
            case '<=':
                return (v1 <= v2) ? true : false;
            case '>':
                return (v1 > v2) ? true : false;
            case '>=':
                return (v1 >= v2) ? true : false;
            case '&&':
                return (v1 && v2) ? true : false;
            case '||':
                return (v1 || v2) ? true : false;
            default:
                return false;
        }

    },
    is_progress_bar: (val) => {
        let f = /(?<valor>^[0-9]+[\.][0-9]+).*(?<sign>%)/mgi.exec(val);
        if(f){
            return `<div class="progress">
            <div class="progress-bar ${f.groups.valor>100? 'bg-danger':''}" role="progressbar" style="width: ${f.groups.valor}%;" aria-valuenow="${f.groups.valor}" aria-valuemin="0" aria-valuemax="100">${f.groups.valor}%</div>
          </div>`
        }else{
            return val;
        }
    },
    frm_type_txt: (tipoInt) => {
        // console.log('===='+tipoInt);
        switch (tipoInt) {
            case 3: return 'number';
            case 253: return 'text';
            case 10: return 'date';
            default:
                break;
        }
    },
    frm_find_val: (column_index, Obj) => {
        return Object.entries(Obj);
    },
    frm_isDisable: (frm, nombreCampo) => {
        switch (frm) {
            case 'frm_add':
            case 'frm_edit':
            case 'frm_delete':
                if (nombreCampo == 'id') {
                    // return 'style="visibility: hidden"'; 
                    return 'disabled';
                }
                break;
            default:
                break;
        }
        return '';
    },
    frm_add_val_default: (frm, nombreCampo) => {
        switch (frm) {
            case 'frm_add':
                if (nombreCampo == 'user') {
                    return 345;
                }
                break;
            default:
                break;
        }
        return '';
    },
    moment: (fecha, formato) => {
        return moment(fecha).format(formato);
    },
    fromNow: (timestamp) => {
        return moment(timestamp).fromNow();
    },
    crearTarjetasEdit:(obj,incluir_Tabla=false)=>{
        // console.log('creando tarjetas');
        let tb;
        if(incluir_Tabla){
            if(fcn.isObj(obj,'fields')){
              tb=`<input type="hidden" value="${obj.fields[0].orgTable}" name="dest" >`
            }
        }
        let s =`<div class='row p-2'>`;
        for (let [k, o] of Object.entries(obj.rows)) {
        //    console.log(newElements(o,obj));
            s+=`<div class=' col-md-3 p-1'>
            <form action="" method="POST" >
            <input type="hidden" name="form_type" value="frm_edit">
            <div class=" card text-center p-1">
            <div class="card-header">
           <span class="badge bg-info text-dark"> ${o.id}</span>
            </div>
            <div class="card-body">
              ${tb}
              ${newElements(o,obj)}
            </div>
            <div class="card-footer text-muted">
              ${fcn.prop_exis(o.timestamp)? moment(o.timestamp).fromNow(): null }
            </div>
          </div>
          </form>
          </div>`;

        }
       
        s+=`</div>`;
        
        // console.log(obj);
        return s;
    },
    ListarOrdenes:(obj)=>{
        let s ='';

        if(fcn.prop_exis(obj.fields[0].orgTable)){
           switch (obj.fields[0].orgTable) {
               case 'ordenes':
                // console.log(obj.fields[0].orgTable);
                s =`<div class="list-group p-2">`;
                for (let [k, o] of Object.entries(obj.rows)) {
                    s+=` <a href="/admin?a=view&t=ordenes&id=${o.id}" class="list-group-item list-group-item-action" aria-current="true">
                           <div class="d-flex w-100 justify-content-between">
                               <h6>${o.nombre}</h6>
                              <span class="badge bg-light text-dark">${moment(o.timestamp).fromNow()}</span>
                            </div>
                            <div class="">${o.descripcion}</div>
                         </a>`;
                }
                s+=`</div>`;

                   break;
           
               default:
                   break;
           }
        }
        
        return s;
    },
    crear_tr: (obj) => {
        let r = `9<tr tb-id="${obj.id}">`;
        for (let [k, o] of Object.entries(obj)) {
            switch (k) {
                case 'fecha':
                case 'inicia':
                case 'termina':
                    r += `<td class="${k} module"> ${moment(o).format('yyyy-MM-DD')}</td>`;
                    break;
                case 'imagen':
                    if (prop_exis(obj.imagen())) {
                        r += `<td class="thumbnail"> <img src="${obj.imagen().src}" class="${obj.imagen().class}" alt="..."></img></td>`;
                    }
                    break;
                default:
                    r += `<td class="${k} module"> ${o} </td>`;
                    break;
            }
        }
        r += `</tr>`;
        return r;
    },
    filtrar_td: (columna, valor) => {
        // /console.log(columna,valor);
        switch (columna) {
            
            case 'imagen':
                // return `<td class="${columna} thumbnail"> <img src="${valor().src}" class="${valor().class}" alt="..."></img></td>`;
                // console.log(valor());
              
                return `<td class="${columna} thumbnail"> ${valor().src}  </td>`;
            case 'fecha':
            case 'inicia':
            case 'termina':
                return `<td class="${columna} module"> ${moment(valor).format('yyyy-MM-DD')}</td>`;
            case 'Opcion':
               let obj=JSON.parse(valor);
                console.log(obj);
                return `<td class="${columna} opcion">
                 <div class="btn-group">
                        <form action="" method="POST" >
                            <input type="hidden" value="{{this.id}}" name="campoId">
                            <input type="hidden" value="edit" name="accion">
                            <button type="submit" class="btn btn-sm btn-outline-warning">Editar</button>
                        </form>
                       
                    </div>
                 
                 
                 </td>`;


            default: return `<td class="${columna} module">${valor}</td>`;
        }


    }




}