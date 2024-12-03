const mongoose = require('mongoose');
const Article = require('../models/article.model');
const { uploadToOSS, getOSSUrl } = require('../utils/oss');
const path = require('path');

// 获取文章列表
const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, keyword } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') }
      ];
    }

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content'); // 列表不返回文章内容

    // 为每个文章生成签名URL
    const articlesWithSignedUrls = await Promise.all(articles.map(async (article) => {
      const doc = article.toObject();
      if (doc.coverImage) {
        // 从 OSS URL 中提取对象名称
        const objectName = doc.coverImage.split('/').slice(3).join('/');
        doc.coverImage = await getOSSUrl(objectName);
      }
      return doc;
    }));

    res.json({
      success: true,
      data: {
        total,
        page: Number(page),
        limit: Number(limit),
        items: articlesWithSignedUrls
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败'
    });
  }
};

// 获取热门文章
const getPopularArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ views: -1 })
      .limit(5)
      .select('-content');

    // 为每个文章生成签名URL
    const articlesWithSignedUrls = await Promise.all(articles.map(async (article) => {
      const doc = article.toObject();
      if (doc.coverImage) {
        // 从 OSS URL 中提取对象名称
        const objectName = doc.coverImage.split('/').slice(3).join('/');
        doc.coverImage = await getOSSUrl(objectName);
      }
      return doc;
    }));

    res.json({
      success: true,
      data: articlesWithSignedUrls
    });
  } catch (error) {
    console.error('Get popular articles error:', error);
    res.status(500).json({
      success: false,
      message: '获取热门文章失败'
    });
  }
};

// 获取单篇文章
const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 生成封面图片的签名URL
    const doc = article.toObject();
    if (doc.coverImage) {
      // 从 OSS URL 中提取对象名称
      const objectName = doc.coverImage.split('/').slice(3).join('/');
      doc.coverImage = await getOSSUrl(objectName);
    }

    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: '获取文章失败'
    });
  }
};

// 上传图片
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const file = req.file;
    const imageExt = path.extname(file.originalname);
    const imageName = `articles/content/${Date.now()}${imageExt}`;

    // 上传到 OSS
    const result = await uploadToOSS(imageName, file.buffer, file.originalname);
    const imageUrl = result.url || getOSSUrl(imageName);

    res.status(200).json({
      success: true,
      message: '图片上传成功',
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败：' + error.message
    });
  }
};

// 上传文章图片到 OSS
const uploadArticleImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: '请上传图片'
      });
    }

    const image = req.files.image;
    const imageExt = path.extname(image.name);
    const imageName = `articles/${Date.now()}${imageExt}`;

    try {
      // 上传图片到 OSS
      const result = await uploadToOSS(imageName, image.data, image.name);
      const signedUrl = await getOSSUrl(imageName);

      res.json({
        success: true,
        data: {
          url: signedUrl
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: '上传图片失败：' + error.message
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: '上传图片失败'
    });
  }
};

// 创建文章
const createArticle = async (req, res) => {
  try {
    const { title, content, category, isPublished } = req.body;
    let coverImage = '';

    // 处理标签数组
    const tags = [];
    for (let key in req.body) {
      if (key.startsWith('tags[')) {
        const tag = req.body[key];
        tags.push(tag);
      }
    }

    // 处理封面图片上传
    if (req.files && req.files.coverImage) {
      const image = req.files.coverImage;
      const imageExt = path.extname(image.name);
      const imageName = `articles/covers/${Date.now()}${imageExt}`;

      // 上传封面到 OSS
      const result = await uploadToOSS(imageName, image.data, image.name);
      coverImage = result.url || getOSSUrl(imageName);
    }
    
    const article = await Article.create({
      title,
      content,
      category,
      tags,
      coverImage,
      isPublished: isPublished === 'true'
    });

    // 生成封面图片的签名URL
    const doc = article.toObject();
    if (doc.coverImage) {
      // 从 OSS URL 中提取对象名称
      const objectName = doc.coverImage.split('/').slice(3).join('/');
      doc.coverImage = await getOSSUrl(objectName);
    }

    res.status(201).json({
      success: true,
      message: '文章创建成功',
      data: doc
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: '创建文章失败'
    });
  }
};

// 更新文章
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPublished } = req.body;
    
    // 构建更新对象，只包含提供的字段
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true';

    // 处理标签数组
    const tags = [];
    for (let key in req.body) {
      if (key.startsWith('tags[')) {
        const tag = req.body[key];
        tags.push(tag);
      }
    }
    updateData.tags = tags;

    // 处理封面图片更新
    if (req.files && req.files.coverImage) {
      const image = req.files.coverImage;
      const imageExt = path.extname(image.name);
      const imageName = `articles/covers/${Date.now()}${imageExt}`;

      // 上传新封面到 OSS
      const result = await uploadToOSS(imageName, image.data, image.name);
      updateData.coverImage = result.url || getOSSUrl(imageName);
    }
    
    const article = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 生成封面图片的签名URL
    const doc = article.toObject();
    if (doc.coverImage) {
      // 从 OSS URL 中提取对象名称
      const objectName = doc.coverImage.split('/').slice(3).join('/');
      doc.coverImage = await getOSSUrl(objectName);
    }

    res.json({
      success: true,
      message: '文章更新成功',
      data: doc
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: '更新文章失败'
    });
  }
};

// 删除文章
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: '删除文章失败'
    });
  }
};

// 获取文章分类列表
const getCategories = async (req, res) => {
  try {
    const categories = await Article.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
};

// 获取文章标签列表
const getTags = async (req, res) => {
  try {
    const tags = await Article.distinct('tags');
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: '获取标签列表失败'
    });
  }
};

// 增加文章浏览量
const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({
      success: false,
      message: '更新浏览量失败'
    });
  }
};

module.exports = {
  getArticles,
  getPopularArticles,
  getArticle,
  uploadImage,
  uploadArticleImage,
  createArticle,
  updateArticle,
  deleteArticle,
  getCategories,
  getTags,
  incrementViews
};
