module.exports={
    isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }else{  
            return res.redirect('/login');
        }
    },
    isSeller(req,res,next){
        if(req.user.level>=1){
            return next();
        }else{  
            return res.redirect('/');
        }
    }
}