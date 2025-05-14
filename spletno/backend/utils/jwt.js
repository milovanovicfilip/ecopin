import * as dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const authoriseUser = function(req, res, next){
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({message: 'Invalid token'});
    }

    try{
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch(error){
        res.status(401).json({message: 'Invalid token'});
    }
}

export const genJWT = function(data){
    return jwt.sign(data, process.env.JWT_SECRET);
}

export const decodeJWT = function(token){
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(error){
        throw new Error('Invalid JWT');
    }
}
