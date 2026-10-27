const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/auth");

// register endpoint
const register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
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

const login = async (req, res)=> {
    const {email, password} = req.body;
    if (!email || !password)
        return res.status(400).json({message: "All fields are required"});
    const foundUser = await User.findOne({email});
    if (!foundUser)
        return res.status(401).json({message: "email or password is incorrect"});
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch)
        return res.status(401).json({message: "email or password is incorrect"});

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
module.exports = {
    register,
    login
}