import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import flash from 'connect-flash'
import session from 'express-session'
import userRoutes from '../routes/users.js'
import User from '../models/usermodel.js'


const app = express()

// morgan para mirar las peticiones
app.use (morgan('dev'))

//Datos del env
dotenv.config({path:'./config.env'})

//Conexion a la base de datos
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    //useUnifiedTopologi:true,
    //UseCreateIndex:true
})
.then(()=>{
    console.log('se conecto a la base')
})
.catch(error => {
    console.log('Error al conectar a la base de datos:')
})

app.use(session({
    secret:'secreto',
    resave:true,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy({usernameField:'email'},User.authenticate()))

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            console.log('Deserialize user:', user);
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});


//middleware de mensaje flash
app.use(flash())
app.use((req,res,next)=>{
    res.locals.success_msg= req.flash(('success_msg'))
    res.locals.error_msg= req.flash(('error_msg'))
    res.locals.error= req.flash(('error'))
    res.locals.currentUser=req.user
    next()
})

//obtenemos datos del formulario
app.use(bodyParser.urlencoded({extended:true}))

//motor de plantilla EJS
app.set('view engine','ejs')

//para uso de la carpeta public
app.use(express.static('public'))

//Rutas
app.use(userRoutes)

export default app