const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const MongoStore = require('connect-mongo');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 导入路由
const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const bannerRoutes = require('./routes/banner.routes');
const favoriteRoutes = require('./routes/favorite.routes');

// 检查环境变量是否正确加载
console.log('Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 导入数据模型
require('./models');

const app = express();

// 中间件配置
app.use(cors({
  origin: [
    'https://render-blog-frontend-orfmyyxoi-yvanq1s-projects.vercel.app',
    'https://render-blog-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 文件上传中间件
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  abortOnLimit: true,
  useTempFiles: false,
  debug: process.env.NODE_ENV !== 'production'
}));

// Session配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: true, // 生产环境必须为 true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none'  // 改为 none 以支持跨域
  }
}));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/favorites', favoriteRoutes);

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Blog Server!' });
});

// 添加session测试路由
app.get('/api/test-session', (req, res) => {
  res.json({
    sessionId: req.sessionID,
    userId: req.session.userId,
    session: req.session
  });
});

// 数据库连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    // 启动服务器
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error details:', error);
    process.exit(1);
  });

// 监听MongoDB连接事件
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});
