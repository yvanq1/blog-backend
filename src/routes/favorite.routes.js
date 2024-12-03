const express = require('express');
const router = express.Router();
const { verifySession } = require('../middlewares/auth');
const favoriteController = require('../controllers/favorite.controller');

// 所有收藏相关的路由都需要验证登录状态
router.use(verifySession);

// 添加收藏
router.post('/', favoriteController.addFavorite);

// 取消收藏
router.delete('/:articleId', favoriteController.removeFavorite);

// 获取收藏状态
router.get('/status/:articleId', favoriteController.getFavoriteStatus);

// 获取收藏列表
router.get('/', favoriteController.getFavorites);

module.exports = router;
