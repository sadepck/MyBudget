/**
 * Formatea un número como moneda con separadores de miles y símbolo $
 * @param {number} amount - El monto a formatear
 * @param {boolean} showSign - Si debe mostrar el signo +/- (default: false)
 * @returns {string} El monto formateado como moneda
 */
export const formatCurrency = (amount, showSign = false) => {
  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatted = formatter.format(Math.abs(amount));
  
  if (showSign) {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${formatted}`;
  }
  
  return amount < 0 ? `-${formatted}` : formatted;
};

/**
 * Formatea una fecha en formato corto (ej: "29 Nov")
 * @param {string|Date} dateString - La fecha a formatear
 * @returns {string} La fecha formateada
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};
