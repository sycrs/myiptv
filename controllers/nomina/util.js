const fcn = require('../../lib/functions');

const offcanvas = (label, objeto) => {
    let r ;
    // fcn.log(objeto.length);
    try {
        if (objeto.length == 0) { return null; }

        r = {
            id: label, html: ` <button class="btn btn-outline-primary " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_${label}"
 aria-controls="offcanvasBottom">
${label.replace('_',' ')}
   <span class="badge bg-danger act_flash">
${objeto.length}
</span>
</button>

<div class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvas_${label}" aria-labelledby="offcanvasBottomLabel">
<div class="offcanvas-header">
  <h5 id="offcanvasBottomLabel"> ${label} </h5>
  <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
</div>
<div class="offcanvas-body table-responsive">
${fcn.generarTablaHTML(objeto, false, label, 'table-responsive')}
</div>
</div>`};
    } catch (error) {
        r = null;
    }
    // fcn.log(r);
    return r;
}

module.exports = {offcanvas};