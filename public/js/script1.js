const socket=io();

socket.on('test',(d)=>{
    console.log(d);
})



//sec jornales

const cjafech=document.querySelector("#jorn_fech");
const search_jrnl=document.querySelector("#search_jrnl");
const navJrn=document.querySelector(".page-item");
const limFech=document.querySelector('[name="rangoF"]');


cjafech.addEventListener('change',(e)=>{
    e.preventDefault();
    socket.emit('limit_fec',limFech.value);
    search_jrnl.submit();

});

limFech.addEventListener('change',(e)=>{
    e.preventDefault();
    socket.emit('limit_fec',limFech.value);
    search_jrnl.submit();
});

document.querySelectorAll(".page-item").forEach(function(element) {
	element.addEventListener('click', function(e) {   
	cjafech.setAttribute('value',this.getAttribute('data-f'));
    socket.emit('limit_fec',limFech.value);
	search_jrnl.submit();
	});
});