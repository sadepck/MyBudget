const mongoose = require('mongoose');

const WishSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del deseo es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0.01, 'El precio debe ser mayor a 0']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'bought', 'archived'],
    default: 'active'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  boughtAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Wish', WishSchema);
