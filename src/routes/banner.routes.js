const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { checkAdmin } = require('../middlewares/admin.middleware');

// 获取Banner列表（公开接口）
router.get('/', bannerController.getBanners);

// 以下接口需要管理员权限
router.post('/', checkAdmin, bannerController.createBanner);
router.put('/:id', checkAdmin, bannerController.updateBanner);
router.delete('/:id', checkAdmin, bannerController.deleteBanner);
router.patch('/reorder', checkAdmin, bannerController.reorderBanners);

module.exports = router;
