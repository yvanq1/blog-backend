const Banner = require('../models/banner.model');
const { handleSuccess, handleError } = require('../utils/response');
const { uploadToOSS, getOSSUrl } = require('../utils/oss');
const path = require('path');

/**
 * 上传Banner
 */
exports.createBanner = async (req, res) => {
  try {
    console.log('Files received:', req.files);
    
    if (!req.files || !req.files.image) {
      return handleError(res, '请上传Banner图片');
    }

    const { title, link = '', order = 0, active = true } = req.body;
    if (!title) {
      return handleError(res, 'Banner标题不能为空');
    }

    const image = req.files.image;
    console.log('Image details:', {
      name: image.name,
      size: image.size,
      mimetype: image.mimetype,
      dataType: typeof image.data,
      dataLength: image.data ? image.data.length : 0,
      tempFilePath: image.tempFilePath
    });

    const imageExt = path.extname(image.name);
    const imageName = `banners/${Date.now()}${imageExt}`;

    try {
      if (!image.data || image.data.length === 0) {
        throw new Error('文件数据为空');
      }

      // 上传图片到 OSS，传入原始文件名用于判断文件类型
      const result = await uploadToOSS(imageName, image.data, image.name);
      console.log('Upload result:', result);
      
      const imageUrl = result.url || getOSSUrl(imageName);

      // 创建Banner记录
      const banner = new Banner({
        title,
        imageUrl,
        link: link || '',
        order: parseInt(order),
        active: active === 'true'
      });

      await banner.save();
      handleSuccess(res, '创建Banner成功', banner);
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      handleError(res, '上传图片失败：' + error.message);
    }
  } catch (error) {
    handleError(res, error.message);
  }
};

/**
 * 获取Banner列表
 */
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    handleSuccess(res, '获取Banner列表成功', banners);
  } catch (error) {
    handleError(res, error.message);
  }
};

/**
 * 更新Banner
 */
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, order, active } = req.body;
    const updateData = { title, link, order: parseInt(order), active: active === 'true' };

    // 如果上传了新图片
    if (req.files && req.files.image) {
      const image = req.files.image;
      console.log('Image details:', {
        name: image.name,
        size: image.size,
        mimetype: image.mimetype,
        dataType: typeof image.data,
        dataLength: image.data ? image.data.length : 0,
        tempFilePath: image.tempFilePath
      });

      const imageExt = path.extname(image.name);
      const imageName = `banners/${Date.now()}${imageExt}`;

      // 上传新图片到 OSS，传入原始文件名
      const result = await uploadToOSS(imageName, image.data, image.name);
      console.log('Upload result:', result);
      
      updateData.imageUrl = result.url || getOSSUrl(imageName);
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!banner) {
      return handleError(res, 'Banner不存在');
    }

    handleSuccess(res, '更新Banner成功', banner);
  } catch (error) {
    console.error('Update error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    handleError(res, error.message);
  }
};

/**
 * 删除Banner
 */
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return handleError(res, 'Banner不存在');
    }

    await Banner.findByIdAndDelete(id);
    handleSuccess(res, '删除Banner成功');
  } catch (error) {
    handleError(res, error.message);
  }
};

/**
 * 调整Banner顺序
 */
exports.reorderBanners = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return handleError(res, '无效的排序数据');
    }

    // 批量更新顺序
    await Promise.all(
      orders.map(({ id, order }) =>
        Banner.findByIdAndUpdate(id, { order })
      )
    );

    const banners = await Banner.find().sort({ order: 1 });
    handleSuccess(res, '更新排序成功', banners);
  } catch (error) {
    console.error('Reorder error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    handleError(res, error.message);
  }
};
