import mongoose,{Schema, model} from 'mongoose';

let productScheme=new Schema({
    name: String,
    price: Number,
    image: String,
    category:{
        type: String,
        enum:['remeras','buzos','pantalones','camperas','zapatillas','accesorios']
    },
    season: {
        type:String,
        enum:['verano','primavera','invierno','otoño'],
        },
    gender:{
        type: String,
        enum:['hombre','mujer','unisex']
    }
})



export default model('Product',productScheme)