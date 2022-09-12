const log = document.getElementById('tb_sock');
let stat_nom = document.getElementById('stat_nom');
let ipsrv=document.getElementById('dta-Serv').getAttribute('data');
let refresh = false;
let chart;
let chart_anual;
let cat_x = [];
//const st_sock= document.getElementById("ht-st-conn");
let ldng = `<b class='act_flash' style="color:green"> Cargando..</b>`;

let reconI = 0;
let idWS = null;
var reg = {
  metodo: 'registro',
  tipo: 'nav',
  key: '7f4',
  date: Date.now(),
  id: null
};

const datatable_asistencia = () => {
  var groupColumn = 0;
  $('#tb_tabla_asist').DataTable({
    "scrollY": 500,
    "scrollX": true,
    "paging": false,
    "createdRow": function (row, data, index) {
      for (let i = 3; i <= 16; i++) {
        // console.log(index,data[i]);
        data[i] == '2' ? $('td', row).eq(i - 1).addClass('pp2') : null;
        data[i] == '3' ? $('td', row).eq(i - 1).addClass('pp3') : null;
      }
    },
    "columnDefs": [
      { "visible": false, "targets": groupColumn }
    ],
    "order": [[groupColumn, 'asc']],
    "drawCallback": function (settings) {
      var api = this.api();
      var rows = api.rows({ page: 'current' }).nodes();
      var last = null;
      api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
        if (last !== group) {
          $(rows).eq(i).before(
            '<tr class="group"><td class="cuadrilla" colspan="16">' + group + '</td></tr>'
          );

          last = group;
        }
      });
    }
  });
}
const datatable_jornales = () => {
  var groupColumn = 0;

  function format(d) {
    let idd=`idj_${Date.now()}`;
    solic_data({objetivo:idd,data:{fecha:d[0],c_act:d[1]}});
    console.log(idd);
    return `
      <div id='${idd}'>
            ${ldng}
       ${d[0]}
      ${d[1]}
      </div> ` ;
      
}

  var dt= $('#tb_tabla_jornales').DataTable(
    {
      "scrollY": 500,
      "scrollX": true,
      "paging": false,
   
      "columnDefs": [
        { "visible": false, "targets": groupColumn }
        ,{
          "targets":1,
          "class":'details-control'
        }
      ],
      "order": [[groupColumn, 'desc']],
      "drawCallback": function (settings) {
        var api = this.api();
        var rows = api.rows({ page: 'current' }).nodes();
        var last = null;
        api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
          if (last !== group) {
            $(rows).eq(i).before(
              '<tr class="group"><td class="cuadrilla" colspan="6">' + group + '</td></tr>'
            );
            last = group;
          }
        });
      }
    });

     // Array to track the ids of the details displayed rows
     var detailRows = [];
 
     $('#tb_tabla_jornales tbody').on('click', 'tr td.details-control', function () {
         var tr = $(this).closest('tr');
        //  console.log(tr);
         var row = dt.row(tr);
         var idx = detailRows.indexOf(tr.attr('id'));
  
        //  alert(idx);
         if (row.child.isShown()) {
             tr.removeClass('details');
             row.child.hide();
  
             // Remove from the 'open' array
             detailRows.splice(idx, 1);
         } else {
             tr.addClass('details');
             row.child(format(row.data())).show();
  
             
             // Add to the 'open' array
             if (idx === -1) {
                 detailRows.push(tr.attr('id'));
             }
         }
     });

      // On each draw, loop over the `detailRows` array and show any child rows
    dt.on('draw', function () {
      detailRows.forEach(function(id, i) {
          $('#' + id + ' td.details-control').trigger('click');
      });

      
  });
}
const generar_grafico_j = (eje_x) => {
  chart = new Highcharts.chart('area_grafico_j', {
    chart: {
      type: 'spline'
    },
    legend: {
      symbolWidth: 40,
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle'
    },
    title: {
      text: 'Jornales'
    },
    subtitle: {
      text: ' ..'
    },
    yAxis: {
      title: {
        text: 'Cantidad'
      },
      accessibility: {
        description: 'Cantidad_'
      },
      crosshair: true
    },
    // xAxis: {
    //   title: {
    //     text: 'Fecha'
    //   },
    //   accessibility: {
    //     description: 'Jornales 2022'
    //   },
    //   categories: eje_x
    // },

    tooltip: {
      valueSuffix: ''
    },
    plotOptions: {
      series: {
        point: {
          events: {
            click: function () {
              window.location.href = this.series.options.website;
            }
          }
        },
        cursor: 'pointer'
      }
    },
    series: [
      // {
      //   states: {
      //     select: {
      //       color: '#a4edba',
      //       dashStyle: 'ShortDashDot'
      //     }
      //   }
      // }

      //    {
      //     name: 'Narrator',
      //     data: [null, null, null, null, 21.4, 30.3]
      //   }, {
      //     name: 'ZoomText/Fusion',
      //     data: [6.1, 6.8, 5.3, 27.5, 6.0, 5.5]
      //   }, {
      //     name: 'Other',
      //     data: [null, 51.5, 45.5, null, 20.2, 15.4]

      //   }
    ],
    xAxis: {
      categories: ['Dec. 2010', 'May 2012', 'Jan. 2014', 'July 2015', 'Oct. 2017', 'Sep. 2019'],
      title: ''
    },
    crosshair: true,
    responsive: {
      rules: [{
        condition: {
          maxWidth: 550
        },
        chartOptions: {
          chart: {
            spacingLeft: 3,
            spacingRight: 3
          },
          legend: {
            itemWidth: 150
          },
          xAxis: {
            categories: [
              // 'Dec. 2010', 'May 2012', 'Jan. 2014', 'July 2015', 'Oct. 2017', 'Sep. 2019'
            ],
            title: ''
          },
          yAxis: {
            visible: false
          }
        }
      }]
    }
  });
  chart.showLoading(ldng);
}
const generar_destajo=()=>{
  chart_destajo=new Highcharts.chart('area_grafico_destajos', {
    chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy'
    },

    legend: {
        enabled: false
    },

    title: {
        text: 'Lotes dc'
    },

    subtitle: {
        text: ''
    },

    accessibility: {
        point: {
            valueDescriptionFormat: '{index}. {point.name}, indice: {point.x}g, diferencia: {point.y}g, real en lote: {point.z}%.'
        }
    },

    xAxis: {
        gridLineWidth: 1,
        title: {
            text: 'Dia del mes'
        },
        labels: {
            format: '{value}'
        },
        // plotLines: [{
        //     color: 'black',
        //     dashStyle: 'dot',
        //     width: 2,
        //     value: 65,
        //     label: {
        //         rotation: 0,
        //         y: 15,
        //         style: {
        //             fontStyle: 'italic'
        //         },
        //         // text: 'Safe fat intake 65g/day'
        //     },
        //     zIndex: 3
        // }],
        accessibility: {
            // rangeDescription: 'Range: 60 to 100 grams.'
        }
    },

    yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
            text: 'diferencia'
        },
        labels: {
            format: '{value} plantas'
        },
        maxPadding: 0.2,
        plotLines: [{
            color: 'black',
            dashStyle: 'dot',
            width: 2,
            value: 0,
            label: {
                align: 'right',
                style: {
                    fontStyle: 'italic'
                },
                text: '',
                x: -10
            },
            zIndex: 3
        }],
        accessibility: {
            // rangeDescription: 'Range: 0 to 160 grams.'
        }
    },

    tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th colspan="2"><h6>{point.descripcion}</h6></th></tr>' +
            '<tr><th>Dia:</th><td>{point.x}</td></tr>' +
            '<tr><th>Real_lote:</th><td>{point.z}</td></tr>' +
            '<tr><th>Diferencia:</th><td>{point.y}</td></tr>',
        footerFormat: '</table>',
        followPointer: true
    },

    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }
    },

    series: [{
        data: [
        ],
        name:'anillada'
    }]

 });
}
const generar_grafico_anual = () => {
  chart_anual = new Highcharts.chart('area_grafico_anual', {
    chart: {
      type: 'areaspline'
    },
    title: {
      text: 'Comparativo Anual 2020 - 2022'
    },

    // legend: {
    //     layout: 'vertical',
    //     align: 'left',
    //     verticalAlign: 'top',
    //     x: 150,
    //     y: 100,
    //     floating: true,
    //     borderWidth: 1,
    //     backgroundColor:
    //         Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
    // },
    xAxis: {
      categories: [
        ' '
      ]
      // ,
      // plotBands: [{ // visualize the weekend
      //     from: 4.5,
      //     to: 6.5,
      //     color: 'rgba(68, 170, 213, .2)'
      // }]
    },
    yAxis: {
      title: {
        text: 'Cantidad'
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' personas'
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.5
      }
      ,
      series: {
        point: {
          events: {
            click: function () {
              console.log(this.category, this.series.name);
              solic_graf(chart,{objetivo: 'grf_jorn', data:new Date(this.category + ' ' + this.series.name)});
              solic_data({objetivo:'cont_asistencia',data:new Date(this.category + ' ' + this.series.name)});
            }
          }
        }
        // , cursor: 'pointer'
      }
    },
    series: [
      {
        name: '2020',
        data: [0]
      }, {
        name: '2022',
        data: [0]
      }
    ]
  });

  chart_anual.showLoading(ldng);
}
//  req ------------
const solic_graf = (grafica,param) => {
  param = { ...param, ...{ metodo: 'req', id: idWS } };
  websocket.send(JSON.stringify(param));
  grafica.showLoading(ldng);
}
const solic_data = (param) => {
  param = { ...param, ...{ metodo: 'req', id: idWS } };
  websocket.send(JSON.stringify(param));
  try {
    document.getElementById(param.objetivo).innerHTML = ldng;
  } catch (error) {
    
  }
  
}

// ----------------

function init() {
  datatable_asistencia();
  datatable_jornales();
  generar_grafico_j(cat_x);
  generar_grafico_anual();
  generar_destajo();
  wsConnect();
}
function wsConnect() {

  websocket = new WebSocket(`ws://${ipsrv}`);

  websocket.onopen = function (evt) {
    //checkbox --------------------------------------------------
    document.getElementById('checkAsistencia').checked = true;
    //-----------------------------------------------------------
    console.log('conectado con exito!');
    if (idWS != null) {
      reg.metodo = 're-conn';
      reg.id = idWS;  // console.log('conexion inicial');
    } else { // console.log('existe id: {0}',idWS);
    }
    if (reconI > 0) { location.reload(); } // recargar pagina
    websocket.send(JSON.stringify(reg));
  };
  websocket.onmessage = function (evt) {

    if (isObj(evt.data)) {
      let ob = JSON.parse(evt.data);
      // console.log(ob);
      //--id cliente---------------------------------------
      if (ob.hasOwnProperty('cliente')) {
        if (ob.cliente.hasOwnProperty('id')) {
          idWS = ob.cliente.id; reg.id = idWS; console.log(ob.cliente.id);
          
          solic_graf(chart,{objetivo: 'grf_jorn', data: null });
          solic_graf(chart_anual,{objetivo: 'grf_anual'});
          solic_data({objetivo:'cont_asistencia',data:null});
          solic_data({objetivo:'destajos_mensual',data:null});
          websocket.send(JSON.stringify({ metodo: 'req', id: idWS , objetivo:'stat_nom',data:null}));
          // ld = { metodo: 'req', id: idWS, objetivo: 'grf_anual' }; websocket.send(JSON.stringify(ld));
        }
      }

      //---client connectados-----------------------------
      if (ob.hasOwnProperty('data')) {
        
        ob.data.hasOwnProperty('MachineName') ? document.getElementById('MachineName').innerHTML = ob.data.MachineName : null;
        ob.data.hasOwnProperty('detail') ? document.getElementById('cuadrilla_act').innerHTML = ob.data.detail.cuaAct : null;
        ob.data.hasOwnProperty('detail') ? document.getElementById('cuad_detail').innerHTML = `Pago:${ob.data.detail.puntoPagoI} Sem:${ob.data.detail.semanaI}` : null;
        if (ob.data.hasOwnProperty('activ_actual')) {
          try {
            let act = chart.get(ob.data.activ_actual);
            let first_val = 0;
            act.data.forEach(element => { //console.log(element);
              if (element.y > 0 && first_val == 0) {
                first_val = element.index;
                return true;
              }
            });

            let lastPoint = chart.series[act.index].points[first_val];
            //lastPoint.setState('hover'); // lastPoint.select();// lastPoint.state = '';
            lastPoint.onMouseOver();
            chart.tooltip.refresh(lastPoint);
            // console.log(act);
          } catch (ex) {
            console.log('error script nom {0}', ex);
          }
        }

        // console.log(ob);
        // console.log('a');

        if (ob.data.hasOwnProperty('data_name')) {
          try {
          ob.data.data_name == 'dt_nomina' ? document.getElementById(ob.data.data_name).innerHTML = ob.data.data_html : null;
          if (ob.data.hasOwnProperty('detail')) {
             document.getElementById('cont_asisitencia').innerHTML =  ob.data.asistencia_html;
             datatable_asistencia();
          }
        } catch (error) {
            
        }
          //   ob.data.hasOwnProperty('dt_import1_html')?document.getElementById('dt_import1_html').innerHTML = ob.data.dt_import1_html:null;
        }
        // console.log(ob);
        // console.log('b');
        // grafico jornales ****************
        if (ob.data.hasOwnProperty('cat_x')) {
          const series = chart.series;
          chart.xAxis[0].setCategories(ob.data['cat_x']);
          chart.setTitle({ text: ob.data['titulo']});
          chart.update({
            series: ob.data['g_series']
          }, true, true);
          chart.hideLoading();
        }
        //********************************* */
        // console.log(ob);
        // console.log('c');
        // grafico comp_anual **************
        if (ob.data.hasOwnProperty('cat_xAxis_anual')) {
          chart_anual.xAxis[0].setCategories(ob.data['cat_xAxis_anual']);
          chart_anual.update({
            series: ob.data['series_anual']
          }, true, true);
          chart_anual.hideLoading();
        }
        // console.log(ob);
        // console.log('d');
        // grafico destajos **************
        // if (ob.data.hasOwnProperty('obj_destajos')) {
        //   console.log('existe destajos');
        //   console.log(ob.data['obj_destajos']);
        //   chart_destajo.update({
        //     series: ob.data['obj_destajos'],
        //     title: {
        //       text: ob.data['titulo']
        //   }
        //   }, true, true);
        // }
        //********************************** */
        // console.log(ob);
        // console.log('e');
        if (ob.data.hasOwnProperty('html_tabla_asist')) {
          document.getElementById('cont_asistencia').innerHTML = ob.data.html_tabla_asist;
          datatable_asistencia();
        }

        if (ob.data.hasOwnProperty('objetivo')) {
          if (ob.data.objetivo.startsWith('idj_')) {
            console.log(ob);
            document.getElementById(ob.data.objetivo).innerHTML = ob.data.html;
          }
        }
        
        //********************************** */
        
        //*********STATUS NOMINAS************************* */
        if (ob.data.hasOwnProperty('stat_nom')) {
          try {
            // console.log(ob.data.stat_nom);
          stat_nom.innerHTML=' ';
          ob.data.stat_nom.forEach(element => {
            // console.log(element.id);
            try {
              stat_nom.innerHTML+=element.html;
              $(`#tb_${element.id}`).DataTable({
                "scrollY": 800,
                "scrollX": true,
                "paging": false
              });
            } catch (error) {  }
          });
          } catch (error) {
            console.log(error);
          }
        }
        // *********************************

        // =======================================
        if (ob.data.hasOwnProperty('stat_nom_times')) {
          try {
            const data = myChart.data;
            // if (data.datasets.length > 0) {
              console.log(ob.data['stat_nom_times']);
              data.datasets=ob.data['stat_nom_times'];
             // myChart.options.plugins.legend.position = 'right';
             // console.log(data.datasets);
            //   data.datasets=[
            //     {
            //         borderWidth:1,
            //         data: [{x:16,y:3},{x:53,y:13},{x:22,y:23}],
            //         label: 'Dataset 1',
            //         radios:0
            //        // borderColor:'rgb(255, 99, 132)' ,
            //       //  backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
            //     },
            //     {
            //         borderWidth:1,
            //         data: [{x:33,y:45},{x:94,y:45},{x:32,y:12}],
            //          label: 'Dataset 2',
            //          radios:0
            //        // borderColor:'rgb(255, 99, 132)' ,
            //     }
            // ];
            // console.log(data.datasets);
              // console.log(data.labels);
              myChart.update();
            // }
          } catch (error) {
            console.log(error);
          }
        }
      // =========================================



      }

    } else {
      loG(evt.data);
    }
  };
  websocket.onerror = function (evt) {
    console.log("ERROR: " + evt.data);

  };
  websocket.onclose = function (evt) {
    setTimeout(function () {
      reconI++; // loG('Reconectando ' + reconI + ' intentos.');
      console.log('Reconectando ' + reconI + ' intentos.');
      wsConnect()
    }, 2000);
  };
  const isObj = (ob) => {
    try {
      let obj = JSON.parse(ob);
      return true;
    } catch (ex) {
      return false;
    }
  }
}
function loG(t) {
  // log.innerHTML = t + `</br>` + log.innerHTML;
  // log.innerHTML = t;
  console.log('recibido: => ', t);
}
function doSend(message) {
  console.log('enviando => ', message);
  websocket.send(message);
}
const isObj = (objeto, ...llaves) => {
  let b = false; let tmp = objeto;
  if (Object.entries(llaves).length == 0) {
    if (typeof objeto !== 'object') {
      return false;
    } else { return true; }
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

window.addEventListener("load", init, false);

