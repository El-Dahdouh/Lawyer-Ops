const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/auth");

// register endpoint
const register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "كافة الحقول مطلوبة" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "المستخدم موجود بالفعل" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
    });
    const accessToken = jwt.sign({
        userId: user._id,
    },
        process.env.SECRET_ACCESS_TOKEN,
        { expiresIn: "15m" });
    const refreshToken = jwt.sign({
        userId: user._id,
    },
        process.env.REFRESH_ACCESS_TOKEN,
        { expiresIn: "7d" });

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ 
        accessToken,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
     });
};

// login endpoint
const login = async (req, res)=> {
    const {email, password} = req.body;
    if (!email || !password)
        return res.status(400).json({message: "كافة الحقول مطلوبة"});
    const foundUser = await User.findOne({email});
    if (!foundUser)
        return res.status(401).json({message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"});
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch)
        return res.status(401).json({message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"});

    const accessToken = jwt.sign({
        userId: foundUser._id
    },
        process.env.SECRET_ACCESS_TOKEN,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign({
        userId: foundUser._id
    },
        process.env.REFRESH_ACCESS_TOKEN,
        { expiresIn: "7d" }
    );

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ 
        accessToken,
        email: foundUser.email,
     });
};

// refresh endpoint
const refresh = async (req,res) =>{
    const cookies = req.cookies;
    if (!cookies?.jwt)
        return res.status(401).json({message: "غير مصرح"});
    const refreshToken = cookies.jwt;
    jwt.verify(refreshToken, process.env.REFRESH_ACCESS_TOKEN, async (err, decoded) => {
        if (err)
            return res.status(403).json({message: "محظور"});
        const foundUser =  await User.findById(decoded.userId);
        if (!foundUser)
            return res.status(401).json({message: " المستخدم غير موجود"});
        const accessToken = jwt.sign({
            userId: foundUser._id
        },
            process.env.SECRET_ACCESS_TOKEN,
            { expiresIn: "15m" }
        );
        res.json({ accessToken });
    })
};

//logout endpoint
const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt)
        return res.sendStatus(204); // No content
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None"  
    });
    res.json({ message: "تم تسجيل الخروج بنجاح" });
}

module.exports = {
    register,
    login,
    refresh,
    logout
}