import express from 'express'
import passport from 'passport'
import crypto from 'crypto'
import async from 'async'
import User from '../models/usermodel.js'
import {transporter} from '../config/index.js'


const router=express.Router()


//Inicio de sesion
router.get('/ingreso',(req,res)=>{
    res.render('pages/ingreso')
})
router.post('/ingreso',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'ingreso',
    failureFlash:'Email o password invalido. Intente nuevamente!'
}))


//Olvide contraseña
router.get('/olvide',(req,res)=>{
    res.render('pages/olvide')
})

router.post('/olvide', async (req,res)=>{
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const user = await User.findOne({ email: req.body.email });
        console.log('Usuario encontrado:', user);
    
        if (!user) {
            return res.redirect('/olvide');
        }
    
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
        await user.save();
    
        const resetLink = `http://${req.headers.host}/recuperar/${token}`;
        const mailOptions = {
          to: user.email,
          from: 'test.proyectosit@gmail.com',
          subject: 'Recuperar contraseña',
          text: `Puedes restablecer tu contraseña haciendo clic en el siguiente enlace: ${resetLink}`,
        };
    
        await transporter.sendMail(mailOptions);
    
        console.log('Correo enviado para restablecer la contraseña.');
        res.redirect('/ingreso');
      } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
      }
});

//Recuperar contraseña
/* router.get('/recuperar/:token', (req, res) => {
    res.render('pages/recuperar', { token: req.params.token });
  }); */
router.get('/recuperar/:token', (req, res)=> {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires : {$gt : Date.now() } })
        .then(user => {
            if(!user) {
                req.flash('error_msg', 'Password reset token in invalid or has been expired.');
                res.redirect('/olvide');
            }

            res.render('pages/recuperar', {token : req.params.token});
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: '+err);
            res.redirect('/olvide');
        });
    });


router.post('/recuperar/:token', (req, res)=>{
    async.waterfall([
    (done) => {
        User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires : {$gt : Date.now() } })
            .then(user => {
                if(!user) {
                    req.flash('error_msg', 'Password reset token in invalid or has been expired.');
                    res.redirect('/olvide');
                }
                if(req.body.password !== req.body.confirmpassword) {
                    req.flash('error_msg', "Password don't match.");
                    return res.redirect('/olvide');
                }
                if (user.setPassword) {
                    user.setPassword(req.body.password, err => {
                        if (err) {
                            console.log("Error setting password:", err);
                            req.flash('error_msg', 'Error setting the password.');
                            return res.redirect('/olvide');
                        }

                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
    
                        user.save()
                        .then(savedUser => {
                            req.logIn(savedUser, err => {
                                if (err) {
                                    console.error("Error logging in user:", err);
                                    req.flash('error_msg', 'Error logging in the user.');
                                    return res.redirect('/olvide');
                                }
                                done(err, savedUser);
                            });
                        })
                        .catch(saveErr => {
                            console.error("Error saving user:", saveErr);
                            req.flash('error_msg', 'Error saving the user.');
                            return res.redirect('/olvide');
                        });
                    });
                } else {
                    req.flash('error_msg', 'Error: setPassword method is not defined in the User model.');
                    return res.redirect('/olvide');
                }
            })
            .catch(err => {
                console.log('ERROR:', err);
                req.flash('error_msg', 'An error occurred during password reset.');
                res.redirect('/olvide');
            });
    }],
    (err, user) => {
        if (err) {
            console.log('An error occurred:', err);
            req.flash('error_msg', 'An error occurred during password reset.');
            return res.redirect('/olvide');
        }
    
        let mailOptions = {
            to: user.email,
            from: 'Ghulam Abbas myapkforest@gmail.com',
            subject: 'Your password has been changed',
            text: 'Hello, ' + user.name + '\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has been changed.'
        };
    
        transporter.sendMail(mailOptions, err => {
            if (err) {
                console.log('Error sending email:', err);
                req.flash('error_msg', 'Error sending the email.');
                return res.redirect('/olvide');
            }
    
            req.flash('success_msg', 'Your password has been changed successfully.');
            res.redirect('/ingreso');
        });
    });
}); 


//Registrar usuario
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