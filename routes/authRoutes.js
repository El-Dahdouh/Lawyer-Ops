const express = require("express");
const router = express.Router();
const{register, login, refresh, logout } = require("../controller/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router