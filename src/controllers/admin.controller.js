const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

// 管理员登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找管理员
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 创建管理员会话
    req.session.adminId = admin._id;
    req.session.isAdmin = true;

    // 返回管理员信息
    res.json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请重试'
    });
  }
};

// 管理员退出登录
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '退出登录失败'
      });
    }
    res.json({
      success: true,
      message: '已成功退出登录'
    });
  });
};

// 获取当前管理员信息
const getCurrentAdmin = async (req, res) => {
  try {
    if (!req.session.adminId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({
      success: false,
      message: '获取管理员信息失败'
    });
  }
};

module.exports = {
  login,
  logout,
  getCurrentAdmin
};
