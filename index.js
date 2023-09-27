import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
import morgan from 'morgan'



const app = express()
app.use (morgan('dev'))

app.use(bodyParser.urlencoded({extended:true}))
//app.set('view',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static('public'))

app.listen(3035,()=>{
    console.log('servidor iniciado')
})

app.get('/',(req,res)=>{
    res.render('pages/index')
})