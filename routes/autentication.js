const express = require('express');
const router = express.Router();
const passport =  require('passport');
const {isLoggedIn} = require('../lib/auth');


router.get('/login',(req,res)=>{
   req.isAuthenticated()?res.redirect('/'):res.render('auth/login');
})

router.post('/login',(req,res,next)=>{
   passport.authenticate('local.login',{
      successRedirect:'/',
      failureRedirect:'/login',
      failureFlash:true
   })(req,res,next);
});


router.get('/signup',(req,res)=>{
    res.render('auth/signup');
});


router.post('/signup',passport.authenticate('local.signup',{
      successRedirect:'/profile',
      failureRedirect:'/signup',
      failureFlash:true
}));

router.get('/logout',(req,res)=>{
      req.logOut();  
      res.redirect('login');
});


module.exports= router; 