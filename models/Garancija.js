const mongoose = require('mongoose');

const GarancijaSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  productCategory: String,
  model: String,
  serialNumber: String,
  purchaseDate: String,
  retailer: String,
  invoiceNumber: String,
  invoiceFile: String 
});

module.exports = mongoose.model('Garancija', GarancijaSchema, 'garancije');