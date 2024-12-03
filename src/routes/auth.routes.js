const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 退出登录
router.post('/logout', authController.logout);

// 获取当前用户信息
router.get('/me', authController.getCurrentUser);

// 检查会话状态
router.get('/check', authController.checkSession);

module.exports = router;
