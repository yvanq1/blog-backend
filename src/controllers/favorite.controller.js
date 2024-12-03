const Favorite = require('../models/favorite.model');
const Article = require('../models/article.model');

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.session.userId;

    // 检查文章是否存在
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 创建收藏
    const favorite = new Favorite({
      userId,
      articleId
    });

    await favorite.save();

    res.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    // 如果是重复收藏导致的错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过该文章'
      });
    }

    console.error('添加收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '添加收藏失败'
    });
  }
};

// 取消收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.session.userId;

    const result = await Favorite.findOneAndDelete({
      userId,
      articleId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在'
      });
    }

    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败'
    });
  }
};

// 获取收藏状态
exports.getFavoriteStatus = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.session.userId;

    const favorite = await Favorite.findOne({
      userId,
      articleId
    });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite
      }
    });
  } catch (error) {
    console.error('获取收藏状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏状态失败'
    });
  }
};

// 获取收藏列表
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.session.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'articleId',
        select: 'title summary createdAt tags category coverImage'
      });

    const total = await Favorite.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        favorites: favorites.map(fav => ({
          id: fav._id,
          articleId: fav.articleId._id,
          article: fav.articleId,
          createdAt: fav.createdAt
        })),
        total
      }
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败'
    });
  }
};
