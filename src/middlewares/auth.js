// 验证用户是否登录
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 检查用户是否已登录
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    handleError(res, '请先登录', 401);
  }
};

/**
 * 检查用户是否是管理员
 * 在后台管理系统中，所有登录用户都视为管理员
 */
exports.isAdmin = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    handleError(res, '请先登录', 401);
  }
};

/**
 * 检查用户是否未登录
 */
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    handleError(res, '您已登录', 403);
  }
};

module.exports = {
  verifyToken,
  isAuthenticated: exports.isAuthenticated,
  isAdmin: exports.isAdmin,
  isNotAuthenticated: exports.isNotAuthenticated
};
