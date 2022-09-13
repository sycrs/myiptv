const path = require('path');
const express = require('express');
const hbsexprss = require('express-handlebars');
const morgan = require('morgan');
const { url } = require('inspector');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const {database} = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'iptv'
};
const passport = require('passport');
const flash = require('connect-flash');
const fs = require('fs');
const clor=require('colors');
const { parse } = require('url');
  const fcn = require('./lib/functions');
const moment = require('moment');
const mysql = require('mysql');

global.stock=[];
global.stock_times=[];

var sessionStore = new MySQLStore(database);

//socket ---------------
const websocket = require("ws");
const wscontroller=require('./controllers/ws-controller.js');

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
// app.use(session({
//   key:'cookie_app',
//   secret:'1068fe216695',
//   store: sessionStore,
//   resave:false,
//   saveUninitialized:false,
// }));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());
//app.use(fileUpload());

// app.use((req,res,next)=>{
//    app.locals.success = req.flash('success');
//    app.locals.warning = req.flash('warning');
//    app.locals.user = req.user;
//     next();
// })

//routes
app.use(require('./routes/autentication'));
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