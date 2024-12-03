const fs = require('fs').promises;
const path = require('path');

/**
 * 删除文件
 * @param {String} filePath - 文件路径
 */
exports.deleteFile = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * 确保目录存在
 * @param {String} dirPath - 目录路径
 */
exports.ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
};

/**
 * 生成唯一文件名
 * @param {String} originalName - 原始文件名
 * @returns {String} 唯一文件名
 */
exports.generateUniqueFileName = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}${ext}`;
};
