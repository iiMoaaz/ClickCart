const mongoose = require('mongoose');
// 1- Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand required'],
      unique: [true, 'Brand must be unique'],
      minlength: [3, 'Too short Brand name'],
      maxlength: [32, 'Too long Brand name'],
    },
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
    const imgUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imgUrl;
  }
};
// in create case
brandSchema.post('save', (doc) => {
  setImgUrl(doc);
});
// in the rest of cases
brandSchema.post('init', (doc) => {
  setImgUrl(doc);
});

// 2- Create model
module.exports = mongoose.model('Brand', brandSchema);
