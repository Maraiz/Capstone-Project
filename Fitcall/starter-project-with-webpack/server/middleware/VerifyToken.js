import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Auth header:', authHeader); // Debug log
    console.log('Extracted token:', token ? token.substring(0, 20) + '...' : 'null'); // Debug log
    
    if(token == null) {
        console.log('No token provided'); // Debug log
        return res.status(401).json({ msg: "Token tidak tersedia" });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
            console.log('Token verification failed:', err.message); // Debug log
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ msg: "Token expired" });
            }
            return res.status(403).json({ msg: "Token tidak valid" });
        }
        
        req.userId = decode.userId;
        req.email = decode.email;
        req.name = decode.name;
        
        console.log('Token verified for user:', decode.userId); // Debug log
        next();
    });
}