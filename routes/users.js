import express from 'express'
import passport from 'passport'
import User from '../models/usermodel.js'


const router=express.Router()

//Inicio de sesion
router.get('/ingreso',(req,res)=>{
    res.render('pages/ingreso')
})
router.post('/ingreso',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'ingreso',
    failureFlash:'Email o password invalido. Intente nuevamente!'
})
)



router.get('/olvide',(req,res)=>{
    res.render('pages/olvide')
})


router.get('/registrar',(req,res)=>{
    res.render('pages/registrar')
})

router.post('/registrar',(req,res)=>{

    let{name, email, password}=req.body
    let userData={
        name:name,
        email:email,
        
    }
    User.register(userData, password, (error,user)=>{
        if(error){
            //mensaje de error de autentificacion, etc 
            req.flash('error_msg','Error:', error)
            res.redirect('/registrar')
        }
        //mensaje de usuario registrado
        req.flash('success_msg', 'Cuenta creada')
        res.render('pages/ingreso')
    })

})


//Pagina principal
router.get('/',(req,res)=>{
    res.render('pages/index')
})

router.get('/categorias',(req,res)=>{
    res.render('pages/categorias')
})


//cerrar sesion
router.get('/logout',(req,res)=>{
    req.logOut()
    req.flash('success_msg','Se cerro la sesion')
    res.redirect('/ingreso')
})


export default router