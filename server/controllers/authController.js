const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const Wish = require('../models/Wish');
const Subscription = require('../models/Subscription');

// Generar JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Opciones para la cookie
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor completa todos los campos'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una cuenta con este email'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password
    });

    // Generar token
    const token = generateToken(user._id);

    // Enviar cookie
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Error en register:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor al registrar usuario'
    });
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingresa email y contraseña'
      });
    }

    // Buscar usuario (incluir password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    // Enviar cookie
    res.cookie('token', token, cookieOptions);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al iniciar sesión'
    });
  }
};

// @desc    Logout usuario / limpiar cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Eliminar cuenta de usuario y todos sus datos
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Eliminar todas las transacciones del usuario
    await Transaction.deleteMany({ user: userId });

    // Eliminar todos los presupuestos del usuario
    await Budget.deleteMany({ user: userId });

    // Eliminar todas las deudas donde el usuario es acreedor
    await Debt.deleteMany({ creditor: userId });

    // Eliminar todos los deseos del usuario
    await Wish.deleteMany({ user: userId });

    // Eliminar todas las suscripciones del usuario
    await Subscription.deleteMany({ user: userId });

    // Eliminar el usuario
    await User.findByIdAndDelete(userId);

    // Limpiar la cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.json({
      success: true,
      message: 'Cuenta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al eliminar la cuenta'
    });
  }
};
