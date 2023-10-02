import express from 'express'

const router=express.Router()

router.get('/',(req,res)=>{
    res.render('pages/categorias')
})




export default router