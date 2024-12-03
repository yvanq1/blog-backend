const express = require('express');
const { uploadImage } = require('../controllers/upload.controller');
const { checkAdmin } = require('../middlewares/admin.middleware');

const router = express.Router();

// 默认上传端点（需要管理员权限）
router.post('/', checkAdmin, uploadImage);
// 兼容旧的上传路径
router.post('/image', checkAdmin, uploadImage);

module.exports = router;
