require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const Debt = require('./models/Debt');
const protect = require('./middleware/protect');
const { register, login, logout, getMe } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// ============ SEGURIDAD ============

// Helmet - Protege cabeceras HTTP
app.use(helmet());

// CORS - Orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.6:3000',
  // Agregar URL de producción aquí:
  // 'https://mybudget.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Rate Limiting - General (100 requests por 15 min)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas peticiones. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting - Auth (5 intentos por 15 min) - MÁS ESTRICTO
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Aplicar rate limiter general a toda la API
app.use('/api', generalLimiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body
app.use(cookieParser());

// Sanitización contra NoSQL Injection
app.use(mongoSanitize());

// Sanitización contra XSS (Cross-Site Scripting)
app.use(xss());

// ============ RUTAS AUTH ============
// Aplicar rate limiter estricto a login y register
app.post('/api/auth/register', authLimiter, register);
app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', protect, getMe);

// ============ RUTAS TRANSACTIONS (PROTEGIDAS) ============

// GET /api/transactions - Obtener transacciones del usuario
app.get('/api/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al obtener transacciones'
    });
  }
});

// POST /api/transactions - Crear nueva transacción
app.post('/api/transactions', protect, async (req, res) => {
  try {
    const { text, amount, category, note, date } = req.body;

    // Validación básica
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingresa una descripción'
      });
    }

    if (amount === undefined || amount === null || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingresa un monto válido'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Por favor selecciona una categoría'
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      text: text.trim(),
      amount: Number(amount),
      category,
      note: note ? note.trim() : '',
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error creando transacción:', error);
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor al crear transacción'
    });
  }
});

// DELETE /api/transactions/reset - Eliminar transacciones del usuario (Demo Reset)
app.delete('/api/transactions/reset', protect, async (req, res) => {
  try {
    const result = await Transaction.deleteMany({ user: req.user._id });
    
    res.json({
      success: true,
      message: 'Todas tus transacciones han sido eliminadas',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error reseteando transacciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al resetear transacciones'
    });
  }
});

// PUT /api/transactions/:id - Actualizar transacción
app.put('/api/transactions/:id', protect, async (req, res) => {
  try {
    const { text, amount, category, note, date } = req.body;

    // Buscar transacción del usuario
    let transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }

    // Actualizar campos
    if (text !== undefined) transaction.text = text.trim();
    if (amount !== undefined) transaction.amount = Number(amount);
    if (category !== undefined) transaction.category = category;
    if (note !== undefined) transaction.note = note ? note.trim() : '';
    if (date !== undefined) transaction.date = new Date(date);

    await transaction.save();

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error actualizando transacción:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de transacción inválido'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor al actualizar transacción'
    });
  }
});

// DELETE /api/transactions/:id - Eliminar transacción
app.delete('/api/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error eliminando transacción:', error);
    
    // Error de ID inválido de MongoDB
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de transacción inválido'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor al eliminar transacción'
    });
  }
});

// ============ RUTAS BUDGETS (PROTEGIDAS) ============

// GET /api/budgets - Obtener presupuestos del usuario
app.get('/api/budgets', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    
    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    console.error('Error obteniendo presupuestos:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al obtener presupuestos'
    });
  }
});

// POST /api/budgets - Crear o actualizar presupuesto
app.post('/api/budgets', protect, async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || limit === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Categoría y límite son requeridos'
      });
    }

    // Buscar si ya existe un presupuesto para esta categoría
    let budget = await Budget.findOne({ 
      user: req.user._id, 
      category 
    });

    if (budget) {
      // Actualizar existente
      budget.limit = Number(limit);
      await budget.save();
    } else {
      // Crear nuevo
      budget = await Budget.create({
        user: req.user._id,
        category,
        limit: Number(limit)
      });
    }

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error creando presupuesto:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al crear presupuesto'
    });
  }
});

// DELETE /api/budgets/:id - Eliminar presupuesto
app.delete('/api/budgets/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Presupuesto no encontrado'
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error eliminando presupuesto:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al eliminar presupuesto'
    });
  }
});

// ============ RUTAS DEBTS (PROTEGIDAS) ============

// GET /api/debts - Obtener deudas (lo que me deben y lo que debo)
app.get('/api/debts', protect, async (req, res) => {
  try {
    // Deudas donde yo soy el acreedor (me deben)
    const owedToMe = await Debt.find({ 
      creditor: req.user._id 
    }).sort({ createdAt: -1 });

    // Deudas donde yo soy el deudor (debo)
    const iOwe = await Debt.find({ 
      debtorEmail: req.user.email.toLowerCase() 
    })
    .populate('creditor', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        owedToMe,
        iOwe
      }
    });
  } catch (error) {
    console.error('Error obteniendo deudas:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al obtener deudas'
    });
  }
});

// POST /api/debts - Crear nueva deuda (prestar dinero)
app.post('/api/debts', protect, async (req, res) => {
  try {
    const { email, amount, description, name } = req.body;

    // Validaciones
    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Email y monto son requeridos'
      });
    }

    // No puedes prestarte a ti mismo
    if (email.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'No puedes registrar una deuda contigo mismo'
      });
    }

    const debt = await Debt.create({
      creditor: req.user._id,
      debtorEmail: email.toLowerCase().trim(),
      debtorName: name || '',
      amount: Number(amount),
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: debt
    });
  } catch (error) {
    console.error('Error creando deuda:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor al crear deuda'
    });
  }
});

// PUT /api/debts/:id/pay - Marcar deuda como pagada
app.put('/api/debts/:id/pay', protect, async (req, res) => {
  try {
    // Solo el acreedor puede marcar como pagada
    const debt = await Debt.findOne({
      _id: req.params.id,
      creditor: req.user._id
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Deuda no encontrada o no tienes permiso'
      });
    }

    debt.isPaid = true;
    debt.paidAt = new Date();
    await debt.save();

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    console.error('Error marcando deuda como pagada:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
});

// PUT /api/debts/:id/unpay - Desmarcar deuda como pagada
app.put('/api/debts/:id/unpay', protect, async (req, res) => {
  try {
    const debt = await Debt.findOne({
      _id: req.params.id,
      creditor: req.user._id
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Deuda no encontrada o no tienes permiso'
      });
    }

    debt.isPaid = false;
    debt.paidAt = null;
    await debt.save();

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    console.error('Error desmarcando deuda:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
});

// DELETE /api/debts/:id - Eliminar deuda
app.delete('/api/debts/:id', protect, async (req, res) => {
  try {
    // Solo el acreedor puede eliminar
    const debt = await Debt.findOne({
      _id: req.params.id,
      creditor: req.user._id
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Deuda no encontrada o no tienes permiso'
      });
    }

    await debt.deleteOne();

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    console.error('Error eliminando deuda:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al eliminar deuda'
    });
  }
});

// Ruta de health check
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'MyBudget API funcionando correctamente',
    database: dbStatus
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api/transactions`);
});
