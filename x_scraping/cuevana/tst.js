const urlExists = require('url-exists-deep');

(async function () {
    const url = 'https://ww1.cuevana3.me/wp-content/uploads/2022/07/drgon-knight-59696-poster-200x300.jpg';
const exists = await urlExists(url);
console.log(exists);
})()
