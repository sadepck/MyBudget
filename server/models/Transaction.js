const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Por favor ingresa una descripción'],
    trim: true,
    maxlength: [100, 'La descripción no puede tener más de 100 caracteres']
  },
  amount: {
    type: Number,
    required: [true, 'Por favor ingresa un monto']
  },
  category: {
    type: String,
    required: [true, 'Por favor selecciona una categoría'],
    trim: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'La nota no puede tener más de 200 caracteres'],
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para mejorar rendimiento en consultas
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ amount: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
