const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { uploadMiddleware } = require('../middleware/upload');

// 文章相关路由
router.get('/', articleController.getArticles);
router.get('/popular', articleController.getPopularArticles);
router.get('/:id', articleController.getArticle);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

// 图片上传路由
router.post('/upload', uploadMiddleware.single('image'), articleController.uploadImage);

module.exports = router;
