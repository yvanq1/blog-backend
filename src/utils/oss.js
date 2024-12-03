const OSS = require('ali-oss');
const mime = require('mime-types');
const path = require('path');

let ossClient = null;

/**
 * 获取 OSS 客户端实例
 */
const getOSSClient = () => {
  if (!ossClient) {
    ossClient = new OSS({
      region: process.env.ALIYUN_OSS_REGION,
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
      bucket: process.env.ALIYUN_OSS_BUCKET,
      internal: process.env.ALIYUN_OSS_INTERNAL === 'true',
      secure: true,
      timeout: 60000
    });
  }
  return ossClient;
};

/**
 * 上传文件到 OSS
 * @param {string} objectName - OSS中的文件路径
 * @param {Buffer} fileBuffer - 文件内容
 * @param {string} originalFilename - 原始文件名，用于判断文件类型
 */
const uploadToOSS = async (objectName, fileBuffer, originalFilename) => {
  const client = getOSSClient();
  
  // 根据文件扩展名获取 MIME 类型
  const mimeType = mime.lookup(originalFilename) || 'application/octet-stream';
  
  const headers = {
    'x-oss-storage-class': 'Standard',
    'x-oss-object-acl': 'public-read',
    'Content-Type': mimeType
  };

  try {
    console.log('Uploading to OSS:', {
      bucket: process.env.ALIYUN_OSS_BUCKET,
      region: process.env.ALIYUN_OSS_REGION,
      objectName,
      mimeType
    });
    
    const result = await client.put(objectName, fileBuffer, { headers });
    console.log('OSS upload result:', result);
    return result;
  } catch (error) {
    console.error('OSS upload error:', error);
    throw error;
  }
};

/**
 * 生成 OSS 文件访问 URL
 */
const getOSSUrl = (objectName) => {
  return `https://${process.env.ALIYUN_OSS_BUCKET}.${process.env.ALIYUN_OSS_ENDPOINT}/${objectName}`;
};

module.exports = {
  getOSSClient,
  uploadToOSS,
  getOSSUrl
};
