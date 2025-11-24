class ApiFeatures {
  constructor(reqQuery, mongooseQuery) {
    this.reqQuery = reqQuery;
    this.mongooseQuery = mongooseQuery;
  }

  // Filteration
  filter() {
    // 1.1) Exluding fields & Copy of query object
    const excludedFields = ['fields', 'sort', 'page', 'limit'];
    let queryString = { ...this.reqQuery };
    excludedFields.forEach((field) => delete queryString[field]);

    // 1.2) REGEX to simulate mongo filtering approach
    queryString = JSON.stringify(queryString).replace(
      /\b(gte|gt|lte|lt)\b/,
      (match) => `$${match}`
    );
    queryString = JSON.parse(queryString);

    this.mongooseQuery = this.mongooseQuery.find(queryString);
    return this;
  }

  // Sort
  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.replace(/,/g, ' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }

    return this;
  }

  // Limit Fields
  limitFields() {
    if (this.reqQuery.fields) {
      // limit string
      const limitBy = this.reqQuery.fields.replace(/,/g, ' ');
      this.mongooseQuery = this.mongooseQuery.select(
        `${limitBy} -category -_id`
      );
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }

    return this;
  }

  // Search
  search(modelName) {
    if (this.reqQuery.q) {
      const { q } = this.reqQuery;

      let search = {};
      if (modelName === 'products') {
        search = {
          $or: [
            { title: new RegExp(q, 'i') },
            { description: new RegExp(q, 'i') },
          ],
        };
      } else {
        search = { name: new RegExp(q, 'i') };
      }

      this.mongooseQuery = this.mongooseQuery.find(search);
    }

    return this;
  }

  // Pagination
  paginate(documentsCount) {
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit * 1 || 5;
    const skip = (page - 1) * limit;
    const endIndex = page * limit; //

    // Pagination result
    const paginationObj = {};
    paginationObj.currentPage = page;
    paginationObj.limit = limit;

    // Only if no search, cuz count of documents will not be true
    if (!this.reqQuery.q) {
      paginationObj.numberOfPages = Math.ceil(documentsCount / limit);
      if (endIndex < documentsCount) {
        paginationObj.nextPage = page + 1;
      }
      if (skip > 0) {
        paginationObj.prevPage = page - 1;
      }
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = paginationObj;

    return this;
  }

  // Populate
  populate(field) {
    this.mongooseQuery = this.mongooseQuery.populate({ path: field });

    return this;
  }
}

module.exports = ApiFeatures;
