const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
  // El usuario que presta el dinero (acreedor)
  creditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Email del deudor (identificador clave)
  debtorEmail: {
    type: String,
    required: [true, 'El email del deudor es requerido'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  // Nombre del deudor (para mostrar)
  debtorName: {
    type: String,
    trim: true,
    default: ''
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
DebtSchema.index({ debtorEmail: 1, isPaid: 1 });
DebtSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Debt', DebtSchema);
