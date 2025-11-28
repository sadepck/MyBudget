const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para mejorar rendimiento en consultas
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ amount: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
