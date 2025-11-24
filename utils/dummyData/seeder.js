require('dotenv').config({ path: '../../config/config.env' });
require('colors');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../../models/productModel');

// Connect DB
require('../../config/database')();

// Import Dummy Data
const data = JSON.parse(fs.readFileSync('./products.json', 'utf-8'));

const insertData = async () => {
  try {
    await Product.create(data);
    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const destructData = async () => {
  try {
    await Product.deleteMany({});
    console.log('All Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(`${error}`);
  }
};

if (process.argv[2] === '-i') insertData();
else if (process.argv[2] === '-d') destructData();
