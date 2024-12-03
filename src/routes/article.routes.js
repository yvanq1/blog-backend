const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { checkAdmin } = require('../middlewares/admin.middleware');

// 公共接口 - 不需要权限
router.get('/', articleController.getArticles);
router.get('/popular', articleController.getPopularArticles);  
router.get('/categories', articleController.getCategories);
router.get('/tags', articleController.getTags);
router.get('/:id', articleController.getArticle);
router.patch('/:id/views', articleController.incrementViews);  

// 后台管理接口 - 需要管理员权限
router.post('/', checkAdmin, articleController.createArticle);
router.put('/:id', checkAdmin, articleController.updateArticle);
router.delete('/:id', checkAdmin, articleController.deleteArticle);
router.post('/upload/image', checkAdmin, articleController.uploadImage);

module.exports = router;
