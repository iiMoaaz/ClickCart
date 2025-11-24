const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

// Get All Documents
exports.getAll = (Model, modelName = '') => {
  return asyncHandler(async (req, res) => {
    // Filter Object
    let filter = {};
    if (req.filterObj) filter = req.filterObj;

    // Build Query
    const documentsCount = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(req.query, Model.find(filter));
    apiFeatures
      .paginate(documentsCount)
      .filter()
      .sort()
      .limitFields()
      .search(modelName);

    // Execute Query
    const { paginationResult } = apiFeatures;
    const documents = await apiFeatures.mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
};

// Get One Document
exports.getOne = (Model, populationOpt) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Build Query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // Execute Query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });
};

// Create Document
exports.createOne = (Model) => {
  return asyncHandler(async (req, res) => {
    const brand = await Model.create(req.body);
    res.status(201).json({ data: brand });
  });
};

// Update Document
exports.updateOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    document.save();
    res.status(200).json({ data: document });
  });
};

// Delete Document
exports.deleteOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    document.remove();
    res.status(204).send();
  });
};
