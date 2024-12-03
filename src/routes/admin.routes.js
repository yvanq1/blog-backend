const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { checkAdmin } = require('../middlewares/admin.middleware');

// 管理员登录
router.post('/login', adminController.login);

// 管理员退出登录
router.post('/logout', checkAdmin, adminController.logout);

// 获取当前管理员信息
router.get('/me', checkAdmin, adminController.getCurrentAdmin);

module.exports = router;
