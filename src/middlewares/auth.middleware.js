/**
 * 检查用户是否已登录的中间件
 */
const checkAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  next();
};

module.exports = {
  checkAuth
};
