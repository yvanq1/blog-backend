const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Admin, User, Article, Banner, Favorite } = require('../models');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 清空所有集合
const clearCollections = async () => {
  await Admin.deleteMany({});
  await User.deleteMany({});
  await Article.deleteMany({});
  await Banner.deleteMany({});
  await Favorite.deleteMany({});
  console.log('All collections cleared');
};

// 创建测试数据
const createTestData = async () => {
  try {
    // 创建管理员
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const admin = await Admin.create({
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com'
    });
    console.log('Admin created:', admin.username);

    // 创建测试用户
    const userPassword = await bcrypt.hash('user123456', 10);
    const users = await User.create([
      {
        username: 'user1',
        password: userPassword,
        email: 'user1@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
      },
      {
        username: 'user2',
        password: userPassword,
        email: 'user2@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2'
      }
    ]);
    console.log('Test users created:', users.map(u => u.username));

    // 创建测试文章
    const articles = await Article.create([
      {
        title: '第一篇测试文章',
        description: '这是第一篇测试文章的描述',
        content: '# 第一篇文章\n\n这是使用 Markdown 格式编写的第一篇测试文章的内容。\n\n## 二级标题\n\n- 列表项1\n- 列表项2',
        category: '技术',
        tags: ['JavaScript', 'Node.js'],
        isPublished: true
      },
      {
        title: '第二篇测试文章',
        description: '这是第二篇测试文章的描述',
        content: '# 第二篇文章\n\n这是第二篇测试文章的内容。\n\n## 代码示例\n\n```javascript\nconsole.log("Hello World!");\n```',
        category: '编程',
        tags: ['React', 'Vue'],
        isPublished: true
      },
      {
        title: '草稿文章',
        description: '这是一篇草稿文章',
        content: '这是草稿内容',
        category: '随笔',
        tags: ['草稿'],
        isPublished: false
      }
    ]);
    console.log('Test articles created:', articles.length);

    // 创建测试轮播图
    const banners = await Banner.create([
      {
        title: '欢迎来到我的博客',
        imageUrl: 'https://picsum.photos/1200/400?random=1',
        link: '/',
        order: 1,
        isActive: true
      },
      {
        title: '精选文章',
        imageUrl: 'https://picsum.photos/1200/400?random=2',
        link: '/articles',
        order: 2,
        isActive: true
      }
    ]);
    console.log('Test banners created:', banners.length);

    // 创建测试收藏
    const favorites = await Favorite.create([
      {
        userId: users[0]._id,
        articleId: articles[0]._id
      },
      {
        userId: users[0]._id,
        articleId: articles[1]._id
      },
      {
        userId: users[1]._id,
        articleId: articles[0]._id
      }
    ]);
    console.log('Test favorites created:', favorites.length);

    console.log('All test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// 运行种子脚本
const runSeed = async () => {
  try {
    await clearCollections();
    await createTestData();
  } catch (error) {
    console.error('Seed script error:', error);
  }
};

runSeed();
