require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('../src/models');

async function createAdmin() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 创建管理员数据
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10)
    };

    // 检查是否已存在
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // 创建管理员
    const admin = await Admin.create(adminData);
    console.log('Admin created successfully:', admin);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
