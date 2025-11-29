const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Verificar token en cookies o en header Authorization
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar que el token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Por favor inicia sesión.'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario del token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware protect:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
};

module.exports = protect;
