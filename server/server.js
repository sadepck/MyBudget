require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ============ RUTAS API ============

// GET /api/transactions - Obtener todas las transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    
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
app.post('/api/transactions', async (req, res) => {
  try {
    const { text, amount, category, note } = req.body;

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
      text: text.trim(),
      amount: Number(amount),
      category,
      note: note ? note.trim() : ''
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

// DELETE /api/transactions/:id - Eliminar transacción
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

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
