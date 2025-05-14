import * as dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
//import { User } from "../Models/User.Model.js";
import { decodeJWT, genJWT } from "../utils/jwt.js";

function generateRandom(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

function Hash(data, salt){
    const pepper = process.env.PEPPER;
    let cypher = data + salt;

    for (let i = 0; i < 1000; i++) {
        cypher = crypto.createHash('sha512', pepper).update(cypher).digest('base64');
    }

    return cypher;
}

export default class UserController{
    constructor(){}

    addUser = async function (request, response) {
        try{
            const {username, password, email, name, lastname} = request.body;

            if(!username || !password || !email || !name || !lastname){
                return response.status(400).json({message: 'All fields must be provided'});
            }

            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }] 
            });

            if(existingUser){
                return res.status(409).json({ 
                    message: 'Username or email already in use' 
                });
            }

            const salt = generateRandom(32);
            const hashedPassword = Hash(password,salt);
            const initials = `${name[0]}${lastname[0]}`.toUpperCase();

            const user = await User.create({
                username,
                password: hashedPassword,
                email,
                name,
                lastname,
                avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab&fontWeight=600`,
                salt
            });

            return res.status(201).json({
                message: "User created successfully",
                user
            });
        }
        catch(error){
            console.log(error);
            return response.status(500).json({message: 'An unexpected error occurred'});
        }
    }

    removeUser = async function (request, response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ 
                    message: "Authorization token required" 
                });
            }

            const decoded = decodeJWT(token);
            if (!decoded) {
                return res.status(401).json({ 
                    message: "Invalid or expired token" 
                });
            }

            await User.findByIdAndDelete(decoded.id);

            return res.status(200).json({ 
                message: "User account deleted successfully" 
            });
        } catch(error) {
            console.log(error);
            return response.status(500).json({message: "An unexpected error occurred"});
        }
    }

    loginUser = async function (request,response) {
        try {
            const { username, password } = request.body;

            if(!username || !password){
                return response.status(400).json({message:"Must enter both username and password"});
            }

            const user = await User.findOne({email:email});

            if(!user){
                return response.status(404).json({message:"Non existing user"});
            }

            const hashed = Hash(password, user.salt);

            if(hashed !== user.password){
                return response.status(400).json({message:"Wrong password"});
            }

            return response.status(200).json({message:"User sucessfully logged in", token: genJWT(user.id)});
        } catch(error) {
            console.error(error);
            return response.status(500).json({message: "An unexpected error occurred"});
        }
    }

    logoutUser = async function (request,response) {
        try {
            response.clearCookie("token");
            response.clearCookie("logged_in");
            return response.status(200).json({message:"User sucessfully logged out"});
        } catch (error) {
            console.error(error);
            return response.status(500).json({message: "An unexpected error occurred"});
        }
    }

    updateProfile = async function (request,response) {
        try {
            const id = decodeJWT(request.cookies["token"]);

            if (!id) {
                return response.status(400).json({message: "Must provide user id"});
            }

            const { username, password, email} = request.body;

            const user = await User.findById(id);

            if (!user) {
                return response.status(404).json({message:"User not found"});
            }

            const newData = {};

            if (username) {
                newData.username = username;
            }

            if (password) {
                newData.password = Hash(password, user.salt);
            }

            if (email) {
                newData.email = email;
            }

            await User.findOneAndUpdate(user.id, newData);

            return response.status(200).json({message: "Sucessfully updated profile"});
        } catch(error) {
            console.error(error);
            return response.status(500).json({message: "An unexpected error occurred"});
        }
    }

    getUserPosts = async function (request,response) {
        try{
            const id=request.params.id;

            const user = await User.findById(id);
            const posts = user.posts;

            return response.status(200).json(posts);
        }
        catch(error){
            console.log(error);
            return response.status(500).json({message: 'An unexpexted error occurred'});
        }
    }

    getUserData = async function (request,response) {
        try{
            const id= decodeJWT(request.params.id);

            
            const user = await User.findById(id, '-password -salt');
            
            // console.log(user);
            return response.status(200).json(user);
        }
        catch(error){
            console.log(error);
            return response.status(500).json({message: 'An unexpexted error occurred'});
        }
    }
}