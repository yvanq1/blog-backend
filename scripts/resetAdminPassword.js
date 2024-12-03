require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('../src/models');

async function resetAdminPassword() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@example.com';
    const newPassword = 'admin123';

    // 查找管理员
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Admin.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    console.log('Admin password reset successfully');
    console.log('Email:', email);
    console.log('New password:', newPassword);

  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetAdminPassword();
