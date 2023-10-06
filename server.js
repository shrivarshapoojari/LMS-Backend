import app from './app.js'
import {config }from 'dotenv'
import cloudinary from'cloudinary'
config();


const PORT =process.env.PORT ||3000

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_secret:process.env.CLOUDINARY_SECRET,
    api_key:process.env.CLOUDINARY_API_KEY

})

app.listen(PORT,()=>{
    console.log("Server up on "+ PORT)
})