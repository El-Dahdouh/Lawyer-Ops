const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) =>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({message: "غير مصرح"});
    const accessToken = authHeader.split(" ")[1];
    jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN, (err, decoded) => {
        if (err)
            return res.status(403).json ({message: "محظور"});
        req.user = decoded.userId;
        next();
    })
}

module.exports = verifyJWT;