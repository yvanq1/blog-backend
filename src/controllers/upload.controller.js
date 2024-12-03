const path = require('path');
const OSS = require('ali-oss');
const { v4: uuidv4 } = require('uuid');

// 创建 OSS 客户端
const client = new OSS({
  region: process.env.ALIYUN_OSS_REGION,
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_OSS_BUCKET,
  endpoint: process.env.ALIYUN_OSS_ENDPOINT
});

// 生成签名URL
async function generateSignedUrl(objectName) {
  try {
    const url = await client.signatureUrl(objectName, {
      expires: 60 * 60 * 24 * 7 // URL有效期7天
    });
    return url;
  } catch (error) {
    console.error('Generate signed URL error:', error);
    throw error;
  }
}

// 上传图片
const uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const file = req.files.file;
    const fileExt = path.extname(file.name);
    const fileName = `uploads/${uuidv4()}${fileExt}`;

    // 上传到 OSS
    await client.put(
      fileName,
      file.tempFilePath || file.data
    );

    // 生成签名URL
    const signedUrl = await generateSignedUrl(fileName);

    // 返回签名URL
    res.json({
      success: true,
      data: {
        url: signedUrl
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: '上传图片失败'
    });
  }
};

module.exports = {
  uploadImage,
  generateSignedUrl
};
