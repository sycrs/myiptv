const fcn = {};
const fs = require('fs').promises;
// const { htmlEntities } = require('../lib/ctrol_query');
// const { tablas } = require('../lib/tablas');
// const colors = require('colors');
const os = require('os');
const moment = require('moment');

const htmlEntities=(str) =>{
    //  console.log('--'+str);
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

fcn.arrays_={
    Group:(array,key)=>{
        return  array.reduce((r, a) => {
            r[a[key]] = [...r[a[key]] || [], a];
            return r;
           }, {});
    },
    getIndexKey:(array,key)=>{
        let s;
        try {
          s = array.reduce((rs, x, i) => {
            Object.keys(x)[0] === key ? (rs = i) : undefined;
            return rs;
          }, undefined);
        } catch (error) {
          s = undefined;
        }
        return s;
      },
      groupByKey:(array,key)=>{
        return  array.reduce((r, a, idx) => {
          let s = fcn.arrays_.getIndexKey(r,a[key]);
          if (s === undefined) {
            r.push({ [a[key]]: { data: [a] } });
          } else {
            r[s][a[key]].data.push(a);
          }
          return r;
        }, []);
      },
    agregar_prop:(array_group,key,operacion)=>{
      switch (operacion) {
        case 'suma':
            
            // let f=group[key].map(item => item.quantity).reduce((prev, curr) => prev + 1, 0); 

            break;
      
        default:
            return null;
      }
    }
}

fcn.fecha_convert_esp_ing=(obj,clave)=>{
    for (let index = 0; index < obj.length; index++) {
        const e = obj[index];
        let f = e[clave].split('/');
        e[clave]=`${f[2]}-${f[1]}-${f[0]}`;
    }
    return obj;
}
fcn.objeto_convertir_val_a_array=(obj)=>{
    let val = Object.entries(obj).reduce((n, ob, i) => {
        let arr = Object.entries(ob).reduce((n0, ob0, i0) => {
            return Object.entries(ob0[1]).reduce((n1, ob1, i1) => {
                n1.push(ob1[1]);
                return n1;
            }, []);
        }, []);
        n.push(arr);
        return n;
    }, []);
    return val;
}
fcn.find_obj_Key=(object,key,...r)=>{
        let result;
        Object.keys(object).some(function(k) {
            if (k === key) {// value = object[k];
                r+=`${k}`;
                result={
                    type:typeof object[k],
                    val:object[k],
                    link:r
                };
                return true;
            }
            if (object[k] && typeof object[k] === 'object') {  
                r+=`${k}>`;
                result = fcn.find_obj_Key(object[k], key,r);
                return result !== undefined;
            }  
        });
        return result;
}
fcn.stringDivider = (str, width, retorno, padend) => {
    try {
        if (str.length > width) {
            var p = width
            for (; p > 0 && str[p] != ' '; p--) { } //proximo espacio en blanco anterior // fcn.log(p)
            if (p > 0) {
                var left = str.substring(0, p);
                padend != null ? left = left.padEnd(width, padend) : null;
                var right = str.substring(p + 1);
                return left + retorno + fcn.stringDivider(right, width, retorno, padend);
            } else {
                for (; p < width && str[p] != ' '; p++) { }
                var left = str.substring(0, p);
                var right = str.substring(p);
                return left + retorno + fcn.stringDivider(right, width, retorno, padend);
            }
        }
        return str;
    } catch (ex) { return str;}
}
fcn.ord_Obj_Simple = (objeto, posicion, orden = 'asc') => {
    let d;
    let or = Object.entries(objeto).sort((a, b) => {
        if (orden === 'desc') {
            if (a[posicion] < b[posicion]) return 1;
            if (a[posicion] > b[posicion]) return -1;
        }
        if (orden === 'asc') {
            if (a[posicion] > b[posicion]) return 1;
            if (a[posicion] < b[posicion]) return -1;
        }
        return 0;
    });

     d = or.reduce((n, o) => {
        n = { ...n, [o[0]]: o[1]};
        return n;
    }, []);

    return d;
}
fcn.prop_exis = (p) => {
    if (p) { return true; } else { return false; }
}
fcn.campos_for_ejec_query = (req, htmlent = true) => {
    return Object.entries(req.body).reduce((nvo, obj) => {
        var k = obj[0];
        if (!nvo[k]) {
            if (k != 'form_type' && k != 'id') {
                //     console.log(obj[1]);
                nvo[k] = htmlent ? htmlEntities(obj[1]) : obj[1];
                // nvo[k] = obj[1];
            }
        } else {
        }
        return nvo;
    }, {});
}
fcn.fusionarObjectsArr = (obj_principal, obj1, obj2, obj3, filtrar_keys, nivel = 2) => {
    const objRes = Object.entries(obj_principal).reduce((nvo, [k, obj]) => {
        let hlp = {};
        if (obj1 != null) { hlp = { ...hlp, ...obj1 }; }
        hlp = { ...hlp, ...obj };
        if (obj2 != null) { hlp = { ...hlp, ...obj2 }; }
        if (obj3 != null) { hlp = { ...hlp, ...obj3 }; }
        if (filtrar_keys != null) { hlp = fcn.obj_filtrar_keys(hlp, filtrar_keys, true, nivel); }
        nvo.push(hlp);
        return nvo;
    }, []);
    return objRes;
}
fcn.obj_filtrar_keys = (objetivo_obj, permitidas_arr, incluir = true, nivel = 1) => {
    if (incluir) {
        if (nivel == 1) {
            return Object.entries(objetivo_obj).reduce((nvo, [k, o]) => {
                //    console.log(o);
                let ob4 = Object.keys(o).filter(key => permitidas_arr.includes(key)).reduce((obj, o2) => {
                    return { ...obj, [o2]: o[o2] };
                }, {});
                return { ...nvo, [k]: ob4 }
            }, {});
        }
        if (nivel == 2) {
            return Object.keys(objetivo_obj).filter(key => permitidas_arr.includes(key)).reduce((obj, key) => {
                return { ...obj, [key]: objetivo_obj[key] };
            }, {});
        }
    } else {
        if (nivel == 1) {
            return Object.entries(objetivo_obj).reduce((nvo, [k, o]) => {
                //    console.log(o);
                let ob4 = Object.keys(o).filter(key => !permitidas_arr.includes(key)).reduce((obj, o2) => {
                    return { ...obj, [o2]: o[o2] };
                }, {});
                return { ...nvo, [k]: ob4 }
            }, {});
        }
        if (nivel == 2) {
            return Object.keys(objetivo_obj).filter(key => !permitidas_arr.includes(key)).reduce((obj, key) => {
                return { ...obj, [key]: objetivo_obj[key] };
            }, {});
        }
    }
}
fcn.eliminarFiles = (registros, dir, thumnail = null) => {
    let logg = 'Objeto nulo';
    if (registros != null) {
        Logg = '';
        for (let [k, o] of Object.entries(registros)) {
            // fs.unlink(`src/public/disck/${o.id_producto}`)
            fs.unlink(`${dir}${o.id_producto}`).then(() => {
                logg += `${o.id_producto} => removido. \n`
                //    console.log(`${o.id_producto} => removido`);
            }).catch(err => {
                logg += `Error => ${err} \n`;
                console.error('ERROR =>', err)
            });
            if (thumnail != null) {
                fs.unlink(`${dir}${o.id_producto}${thumnail}`)
                    .then(() => {
                        logg += `${o.id_producto} => removido. \n`
                        // console.log(`${o.id_producto} => removido`);
                    }).catch(err => {
                        logg += `Error => ${err} \n`;
                        console.error('ERROR =>', err)
                    });
            }
        }
    }
    console.log(logg);
    return logg;
}
fcn.isObj = (objeto, ...llaves) => {
    let b = false; let tmp = objeto;
    if(Object.entries(llaves).length==0){
         if(typeof objeto !== 'object') {
           return false;
       }else{return true;}
    }
  
    llaves.forEach((key) => {
        try {
            if (tmp.hasOwnProperty(key)) {
                b = true;
                tmp = { ...objeto[key] };
            } else {
                b = false;
                return false;
            }
        } catch (e) { return false; }
      });
    return b;
}
fcn.log = (...v) => {
    v.forEach((e)=>{
        console.log(`[${moment().format('HH:mm:ss.SSS')}] ${e}`);
    });
}
fcn.table = (...v) => {
    v.forEach((e)=>{
        console.table(e);
    });
}
fcn.genRandom = (num=1) =>{ 
    let str='';
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    for(let i=1;i<=num;i++){ str+=s4();}
    return str;
}
fcn.objecGroup=(objeto,clave)=>{
    return  Object.entries(objeto).reduce((n, ob, i) => {
         let k = ob[1][clave];
         if (!n[k]) {
             n[k] = { 0: ob[1] };
         } else {
             let c = Object.entries(n[k]).length;
             n[k] = { ...n[k], [c]: ob[1] };
         }
         return n;
     }, {});
}
fcn.convert_val_of_keys_to_array = (objeto, key) => {
    return Object.entries(objeto).reduce((n, ob, i) => {
        n.push(ob[1][key]);
        return n;
    }, []);
}
fcn.objAddProp=(obj,nom_Propiedad,valor,coincidir_Id=null)=>{
    return Object.entries(obj).reduce((n,v,i)=>{
        if(coincidir_Id==null){
               v[1][nom_Propiedad]=valor;
        }else{
            v[1][nom_Propiedad]='';
          if(fcn.isObj(v[1],'id')){
            v[1].id==coincidir_Id?v[1][nom_Propiedad]=valor:null;
          }
        }
        n={...n,[i]:v[1]};
       return n
    },{});
}
fcn.tstpromise=(milseg=2000)=>{
    return new Promise(resolve => {
        setTimeout(() => {
          resolve(`resuelto! ${milseg/1000} segundos`);
        }, milseg);
      });
}
fcn.rdm=(min, max) => {
    return Math.random() * (max - min) + min;
}
fcn.sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
fcn.generarTablaHTML = (obj, ind = true, id = '', clase = 'table display') => {
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
    str += `<table id='tb_${id}' class='${clase}' style="width:100%">${head}<tbody>${row}</tbody></table>`;
    return str;
}
fcn.getIp=()=>{

var ifaces = os.networkInterfaces();
let rs=[];
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
     // return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      if (iface.address=='127.0.0.1') return;
      rs.push([ifname,iface.address]);
    //   console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
    //   rs.push([ifname,iface.address]);
    //   console.log(ifname, iface.address);
    }
    ++alias;
  });
 
});
return rs;
}
fcn.getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + s4();
};
module.exports = fcn;