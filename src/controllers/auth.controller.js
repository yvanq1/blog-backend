const bcrypt = require('bcryptjs');
const { User } = require('../models');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    });

    // 创建会话
    req.session.userId = user._id;

    // 返回用户信息
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.warn('Register error:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请重试'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 创建会话
    req.session.userId = user._id;

    // 返回用户信息
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请重试'
    });
  }
};

// 退出登录
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '退出登录失败'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: '退出登录成功'
    });
  });
};

// 检查会话状态
const checkSession = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      success: false,
      message: '会话检查失败'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  checkSession
};
