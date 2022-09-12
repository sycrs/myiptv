const fcn = require('../../lib/functions');
let urlExists = require('url-exists-deep');
const puppeteer = require('puppeteer');

const fcn_ = {
  f: {
    categorias: (obj) => {
      let = c = obj.length;
      let cat_0 = fcn.objeto_convertir_val_a_array(obj).join(',');
      cat_0 = cat_0.split(',');
      cat_0 = cat_0.map(x => x.trim());
      cat_0 = [...new Set(cat_0)];
      cat_0 = cat_0.sort();
      return { obj: cat_0, count: c };
    },
    paginacion: (index, max,offset) => {
      isNaN(index)? index=1: index = parseInt(index);
      let pag_max = Math.ceil(max / offset);  let pags = [];
      (index * offset) <= max ? null : index = pag_max;
      for (let i = 1; i <= pag_max; i++) {
        pags.push(i);
      }
      pags = pags.filter(x => x >= index - 1 && x <= index + 1);
      return { pag: index, pags,pag_max,offset }
    }
  },
  probar_enlace:async(enlace)=>{
    if ( enlace!= null) {
      let exist = await urlExists(enlace);
      if (exist != false) {
        return true;
      }
    }else{
      return false;
    }
  }

}

module.exports = fcn_;