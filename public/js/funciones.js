
const log = document.getElementById('tb_sock');
const st_sock= document.getElementById("ht-st-conn");

let reconI = 0;
let idWS=null;
var reg = {
    metodo: 'registro',
    tipo: 'nav',
    key: '7f4',
    date: Date.now(),
    id: null
};

function init() {  wsConnect(); }

const setStSock=(s)=>{
    st_sock.classList.remove('bg-success');
    st_sock.classList.remove('bg-warning');
    st_sock.classList.remove('bg-danger');
    if(s){
        st_sock.classList.add('bg-success'); 
    }else{st_sock.classList.add('bg-danger');}
}

function wsConnect() {
    setStSock(true);
   // websocket = new WebSocket("wss://myiptvm3u.herokuapp.com","protocolOne");
//    websocket = new WebSocket("ws://172.16.2.81:3000");
   websocket = new WebSocket("ws://192.168.0.131:3000");
   // websocket = new WebSocket("ws://localhost:3000");
//    websocket = new WebSocket("wss://friendly-cherry-78544.pktriot.net");
    websocket.onopen = function (evt) {
        loG('conectado con exito');
        setStSock(true);

        if (idWS!=null) {
            reg.metodo = 're-conn';
            reg.id = idWS;
        }

        doSend(JSON.stringify(reg));
    };

    websocket.onclose = function (evt) {
        setStSock(false);
        setTimeout(function () {
            reconI++;
            loG('Reconectando ' + reconI + ' intentos.');
            wsConnect()
        }, 2000);
    };

   const prop_exis=(p)=>{
       if(p){
           return true;
       }else{
           return false;
       }
   }

   //const prop_exis=(p)=> p? true:false;

    const isObj = (ob) => {
        try {
            let obj = JSON.parse(ob);
            return true;
        } catch (ex) {
            return false;
        }
    }

    websocket.onmessage = function (evt) {
     
            if (isObj(evt.data)) {
                let ob = JSON.parse(evt.data);
                console.log(ob);
                //--id cliente---------------------------------------
                if (prop_exis(ob.tipo) && ob.tipo == 'registro') {  idWS = ob.cliente.id; }
                //---client connectados------------------------------
                if(prop_exis(ob.metodo)&&prop_exis(ob.tabla)){ loG(ob.tabla);}

                // if (evt.data instanceof Blob) {
                //     console.log('msj tipo Blob');
                //     var reader = new FileReader();
                //     reader.onload = function (e) {
                //         loG('serv: ' + reader.result);
                //     }
                //     reader.readAsText(evt.data);
                // } else {
                //     loG('serv: ' + evt.data);
                // }
            }else{
                loG(evt.data);
            }
    };

    websocket.onerror = function (evt) {
        setStSock(false);
        console.log("ERROR: " + evt.data);

    };
}

function loG(t) {
   // log.innerHTML = t + `</br>` + log.innerHTML;
    log.innerHTML = t;
}

function doSend(message) {
    console.log('enviando => ', message);
    websocket.send(message);
}

window.addEventListener("load", init, false);

// $(document).ready( function () {
//     $('table').DataTable();
// } );