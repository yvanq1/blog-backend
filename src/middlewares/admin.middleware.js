/**
 * 检查管理员是否已登录的中间件
 */
const checkAdmin = (req, res, next) => {
  if (!req.session.adminId || !req.session.isAdmin) {
    return res.status(401).json({
      success: false,
      message: '请先以管理员身份登录'
    });
  }
  next();
};

module.exports = {
  checkAdmin
};
