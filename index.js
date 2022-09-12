const path = require('path');
const express = require('express');
const hbsexprss = require('express-handlebars');
const morgan = require('morgan');
const { url } = require('inspector');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const {database} = require('./keys');
const passport = require('passport');
const flash = require('connect-flash');
//const fileUpload = require('express-fileupload');
const bt = require('./bootWhatsapp/index.js');
const fs = require('fs');
const clor=require('colors');
const { parse } = require('url');
const fcn = require('./lib/functions');
const str_query = require('./lib/nomina/query');
const moment = require('moment');
const mysql = require('mysql');

const sw=require('./bootWhatsapp/nom_virtual/sessionW');

const iniciarBot=()=>{
  try{
    bt.iniciar();
    }catch(err){
      fcn.log(clor.bgRed(`Error en bot ${err}`));
      iniciarBot();
    }
}

//=======================================================================
// const custions = require('./bootWhatsapp/nom_virtual/cuestions/alta');
// let p1=new custions.Alta();
// p1.token='tks7e45c9886b8b';
// global.sessionW.push(
//   p1
// );
// // console.log(p1.sigCuestion)
// let msg;
// do {
//   msg=p1.sigCuestion;
//   fcn.log(clor.magenta(msg.msg));
//   p1[msg.key]='resp atm';
//   fcn.log(clor.bgYellow(p1.obj));
// } while (msg.hasOwnProperty('msg'));
//=======================================================================


 //iniciarBot();
// datos precargados
const stock = require('./controllers/nomina/default_stock').f;
global.stock=[];
global.stock_times=[];

// (async function () {await stock.newload('jornales_graf',mysql.format(str_query.jornales(),[moment().add(-21, 'days').format('yyyy-MM-DD'),moment().format('yyyy-MM-DD')]),'');})();
// (async function () {await stock.newload('jornales_anual',mysql.format(str_query.comparativo_anual()),'');})();
// (async function () {await stock.newload('jornales_imp_desglosado',mysql.format(str_query.jornales_desgl_imp()),'');})();
// (async function () {await stock.newload('cont_asistencia',mysql.format(str_query.asistencia( moment().format('yyyy-MM-DD') )),'');})();
// (async function () {await stock.newload('destajos_mensual',mysql.format(str_query.estado_destajos_mensual()),'');})();
// (async function () {await stock.newload('empleados_excluidos', mysql.format(str_query.empleados_excluidos_nom()), '','','stat_nom');})();
// (async function () {await stock.newload('bonos', mysql.format(str_query.bonos_sem()), '','','stat_nom');})();
// (async function () {await stock.newload('descuentos', mysql.format(str_query.obtener_descrip_clave(),['%[descuento]%']), '','','stat_nom');})();
// (async function () {await stock.newload('empleados_duplicados', mysql.format(str_query.obtenerDuplicados()), '','','stat_nom');})();

  //cronom -------
  // (async function () {
  //  setInterval(() => {
  //   fcn.log(clor.bgYellow(Date.now()));
  //  }, 1000);
  // })();

// fcn.log(fcn.getIp()[0][1]);

var sessionStore = new MySQLStore(database);

//socket ---------------
const websocket = require("ws");
const wscontroller=require('./controllers/ws-controller.js');
// const { color } = require('jimp');

//inicializacion
const app = express();
require('./lib/passport');

//setting
app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));

app.engine('.hbs',hbsexprss({
    defaultLayout:'home',
    layoutsDir:path.join(app.get('views'),'layouts/nomina'),
    partialsDir:path.join(app.get('views'),'partials'),
    extname:'hbs',
    helpers:require('./lib/handlebars')
}));   

 app.set('view engine','.hbs');

 //midlewares
app.set(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({
  key:'cookie_app',
  secret:'1068fe216695',
  store: sessionStore,
  resave:false,
  saveUninitialized:false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(fileUpload());

app.use((req,res,next)=>{
   app.locals.success = req.flash('success');
   app.locals.warning = req.flash('warning');
   app.locals.user = req.user;
    next();
})

//routes
app.use(require('./routes'));
app.use(require('./routes/autentication'));
app.use('/jornales',require('./routes/jornales'));
app.use(require('./routes/store'));
app.use('/remoto',require('./routes/nomina_remoto'));
app.use('/movil',require('./routes/movil/'));

app.use('/iptvlist',require('./routes/tv/'));

//static
app.use(express.static(path.join(__dirname,'public')));

const server = app.listen(app.get('port'),()=>{
    console.log('Servidor ejecutandose en puerto: '+ app.get('port'));
    global.port=app.get('port');
  });

const wss = new websocket.Server({ noServer: true });

wss.on('connection', wscontroller);

server.on('upgrade', function upgrade(request, socket, head) {
  // This function is not defined on purpose. Implement it with your own logic.
  const { pathname } = parse(request.url);
  fcn.log(clor.green(pathname));
    const ip = request.socket.remoteAddress;
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request,ip);
  
  });
});

 
// wss.on('connection', function connection(ws, request,ip) {


//   ws.on('message', function message(msg) {
//     console.log(`Mensaje recibido: [${msg}] de ip: ${ip}`);
//       //enviar todos los clientes excepto emisor
//        wss.clients.forEach((client)=>{
//            if(client!=ws && client.readyState==websocket.OPEN){
//                client.send(`${msg} -- ${ip} `);
//            }
//        })
//   });
// });

// const ws = new websocket.Server({server});

// ws.on('connection', (socket,req)=>{

//   const ip = req.socket.remoteAddress;

//    socket.on('message',(msj)=>{
//        console.log('msj recibido: %s', msj);
       
//        socket.send('bienvenido cliente');

//        //enviar todos los clientes excepto emisor
//        ws.clients.forEach((client)=>{
//            if(client!=socket && client.readyState==websocket.OPEN){
//                client.send(msj);
//            }
//        })
//    })
// })


