import express from 'express';
import dotenv from 'dotenv';
var app = express()
dotenv.config()

app.listen(process.env.PORT,()=>{
    console.log(`Listening ${process.env.PORT}...`);
})