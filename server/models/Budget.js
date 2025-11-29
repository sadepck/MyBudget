const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida']
  },
  limit: {
    type: Number,
    required: [true, 'El límite es requerido'],
    min: [0, 'El límite debe ser mayor a 0']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto único: un usuario solo puede tener un presupuesto por categoría
BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
