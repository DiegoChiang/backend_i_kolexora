const mongoose = require('mongoose');

const cartProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, {
  _id: false
});

const cartSchema = new mongoose.Schema({
  products: {
    type: [cartProductSchema],
    default: []
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'carts'
});

cartSchema.virtual('id').get(function () {
  return this._id.toString();
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('carts', cartSchema);
