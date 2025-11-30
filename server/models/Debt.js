const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
  // El usuario que presta el dinero (acreedor)
  creditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Teléfono del deudor (identificador clave para WhatsApp)
  debtorPhone: {
    type: String,
    trim: true,
    default: ''
  },
  // Nombre del deudor (para mostrar)
  debtorName: {
    type: String,
    trim: true,
    default: ''
  },
  // Nombre del acreedor (para deudas propias - lo que yo debo)
  creditorName: {
    type: String,
    trim: true,
    default: ''
  },
  // Indica si es una deuda propia (lo que yo debo a alguien)
  isMyDebt: {
    type: Boolean,
    default: false
  },
  // Monto de la deuda
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto debe ser mayor a 0']
  },
  // Descripción/concepto del préstamo
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Estado de pago
  isPaid: {
    type: Boolean,
    default: false
  },
  // Fecha de pago (cuando se marca como pagado)
  paidAt: {
    type: Date,
    default: null
  },
  // Fecha de creación
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para búsquedas eficientes
DebtSchema.index({ creditor: 1, isPaid: 1 });
DebtSchema.index({ debtorPhone: 1, isPaid: 1 });
DebtSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Debt', DebtSchema);
