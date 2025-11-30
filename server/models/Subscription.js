const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del servicio es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto debe ser mayor a 0']
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  category: {
    type: String,
    trim: true,
    default: 'Entretenimiento'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual para calcular el costo mensual
SubscriptionSchema.virtual('monthlyAmount').get(function() {
  return this.billingCycle === 'yearly' ? this.amount / 12 : this.amount;
});

// Virtual para calcular el costo anual
SubscriptionSchema.virtual('yearlyAmount').get(function() {
  return this.billingCycle === 'monthly' ? this.amount * 12 : this.amount;
});

// Incluir virtuals en JSON
SubscriptionSchema.set('toJSON', { virtuals: true });
SubscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
