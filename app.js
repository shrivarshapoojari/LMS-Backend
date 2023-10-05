
require('dotenv').config();
const cookieParser = require('cookie-parser');

const express=require('express')
const userRoutes=require('./routes/user.routes')
const app=express();
const cors=require('cors')
const errorMiddleware=require('./middlewares/error.middleware')
 const connectToDB=require("../server/config/dbConnection");
const morgan = require('morgan');
app.use(express.json())

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}))
app.use(morgan('dev'))

connectToDB();
app.use(cookieParser());

app.use('/ping',(req,res)=>{
    res.send('pong')
})


app.use('/api/v1/user',userRoutes);



// if any route not found

app.all('*',(req,res)=>{
    res.status(404).send('OOPS !! Page  Not Found')
})

app.use(errorMiddleware);

 module.exports=app;