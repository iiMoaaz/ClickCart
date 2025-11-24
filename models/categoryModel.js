const mongoose = require('mongoose');
// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    // A and B => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

/** return base url + img name **/
// logic
const setImgUrl = (doc) => {
  if (doc.image) {
    const imgUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imgUrl;
  }
};
// in the rest of cases
categorySchema.post('init', (doc) => {
  setImgUrl(doc);
});
// in create case
categorySchema.post('save', (doc) => {
  setImgUrl(doc);
});

// 2- Create model
const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
