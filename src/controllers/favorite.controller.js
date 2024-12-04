const Favorite = require('../models/favorite.model');
const Article = require('../models/article.model');

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.user._id;

    // 检查文章是否存在
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({ userId, articleId });
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过了'
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
    const userId = req.user._id;

    const result = await Favorite.findOneAndDelete({ userId, articleId });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在'
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
    const userId = req.user._id;

    const favorite = await Favorite.findOne({ userId, articleId });

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
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ userId })
      .populate('articleId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Favorite.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        favorites: favorites.map(f => ({
          id: f._id,
          article: f.articleId
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
