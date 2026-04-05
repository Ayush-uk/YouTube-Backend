import jwt from "jsonwebtoken";

export const authmiddleware = (req,res , next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(!token){return res.status(401).json({
            message:"unauthorized"
        })}
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decoded;
        next();
        
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized",
            error: error.message,
        });

        
    }
}