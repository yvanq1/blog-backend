const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用户信息和token
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
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
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用户信息和token
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.warn('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请重试'
    });
  }
};

// 检查认证状态
const checkAuth = async (req, res) => {
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
    res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
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
    res.status(401).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

module.exports = {
  register,
  login,
  checkAuth,
  getCurrentUser
};
