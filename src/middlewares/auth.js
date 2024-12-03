// 验证用户是否登录
const verifySession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  next();
};

/**
 * 检查用户是否已登录
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
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
  if (req.session && req.session.userId) {
    next();
  } else {
    handleError(res, '请先登录', 401);
  }
};

/**
 * 检查用户是否未登录
 */
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    next();
  } else {
    handleError(res, '您已登录', 403);
  }
};

module.exports = {
  verifySession,
  isAuthenticated: exports.isAuthenticated,
  isAdmin: exports.isAdmin,
  isNotAuthenticated: exports.isNotAuthenticated
};
