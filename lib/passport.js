const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');
const md5 = require('md5');
const revmd5 = require('reverse-md5');

var rev = revmd5({
    lettersUpper: false,
    lettersLower: true,
    numbers: true,
    special: false,
    whitespace: true,
    maxLen: 12
})

passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username,password,done)=>{
    
   const rows = await pool.query('SELECT * FROM users Where username = ?',[username]);
   if (rows.length>0){
       const user =rows[0];
       try {
           console.log(`validar ${password}  ==  ${user.password} --`);
            // console.log(rev(password).str);

       } catch (error) {
          console.log(error) ;
       }
     
       const validPassword= await helpers.matchpassword(password,user.password);
       if(validPassword){
           done(null,user,req.flash('success', 'Bienvenido '+user.username));
       }else{
           done(null,false,req.flash('warning','Password invalido.'));
       }
   }else{
       done(null,false,req.flash('warning','Usuario Invalido.'));
   }

}))


passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { fullname } = req.body;
    const { number } = req.body;
    console.log(req.body);
    const newUser = {
        username, 
        password,
        fullname,
        number
    };
    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO users SET ?', [newUser]);
    newUser.id = result.insertId;
   console.log(result);
    return done(null, newUser);
}));


passport.serializeUser((user, done) => {
   // console.log(user);
    done(null, {id:user.id,level:user.level,username:user.username});
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM users Where id=?', [id.id]);
    //console.log(rows[0]);
    done(null, rows[0]);
})