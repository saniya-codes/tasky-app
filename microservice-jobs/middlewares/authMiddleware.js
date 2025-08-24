import jwt from "jsonwebtoken";
import fs from "fs"

function individualAuthMiddleware(req, res, next){
    try{
        let token = req.headers["x-auth-header"]
        var decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_USER);
        if(decoded){
            req.user = decoded;
            next();
        }
    }catch(error){
        console.log(error);
    }
}

function organisationAuthMiddleware(req, res, next){
    try{
        let token = req.headers["x-auth-header"]
        var decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_ORG);
        if(decoded){
            req.user = decoded;
            next();
        }
    }catch(error){
        console.log(error);
    }
}

export {individualAuthMiddleware, organisationAuthMiddleware}