import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

var mongodb = "mongodb+srv://milovanovic8filip:geslo123@cluster0.gsr8kmn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express()
dotenv.config()

app.listen(process.env.PORT,()=>{
    console.log(`Listening ${process.env.PORT}...`);
})