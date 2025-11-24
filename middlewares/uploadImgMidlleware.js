const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerConfig = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError(`Uploaded file must be type of image only`), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImg = (uploadField) => multerConfig().single(uploadField);
exports.uploadMixOfImgs = (fields) => multerConfig().fields(fields);
