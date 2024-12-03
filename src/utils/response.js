/**
 * 处理成功响应
 * @param {Object} res - Express response对象
 * @param {String} message - 响应消息
 * @param {*} data - 响应数据
 */
exports.handleSuccess = (res, message = null, data = null) => {
  const response = {
    success: true
  };

  if (message) response.message = message;
  if (data !== null) response.data = data;

  res.json(response);
};

/**
 * 处理错误响应
 * @param {Object} res - Express response对象
 * @param {String|Error} error - 错误信息或错误对象
 * @param {Number} status - HTTP状态码
 */
exports.handleError = (res, error, status = 400) => {
  const response = {
    success: false,
    message: error instanceof Error ? error.message : error
  };

  res.status(status).json(response);
};
