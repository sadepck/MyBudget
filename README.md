# MyBudget - Expense Tracker

Una aplicación web PWA para rastrear gastos personales construida con el stack MERN.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + PWA
- **Backend**: Node.js + Express + Mongoose
- **Base de datos**: MongoDB (Atlas o Local)

## Estructura del Proyecto

```
MyBudget/
├── client/                    # Frontend React + Vite
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── constants/         # Categorías y constantes
│   │   ├── context/           # Context API (Theme)
│   │   └── App.jsx
│   └── package.json
├── server/                    # Backend Express
│   ├── config/
│   │   └── db.js              # Conexión MongoDB
│   ├── models/
│   │   └── Transaction.js     # Modelo Mongoose
│   ├── server.js
│   └── package.json
└── README.md
```

## Instalación

### 1. Instalar dependencias del servidor
```bash
cd server
npm install
```

### 2. Configurar MongoDB
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu URI de MongoDB
```

### 3. Instalar dependencias del cliente
```bash
cd client
npm install
```

## Configuración de MongoDB

### Opción A: MongoDB Atlas (Cloud - Recomendado)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0 Sandbox)
3. En "Database Access", crea un usuario con password
4. En "Network Access", agrega tu IP (o 0.0.0.0/0 para desarrollo)
5. Click en "Connect" → "Connect your application"
6. Copia la URI y reemplaza `<password>` con tu contraseña

```env
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/mybudget?retryWrites=true&w=majority
```

### Opción B: MongoDB Local

1. Instala [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Inicia el servicio de MongoDB
3. Usa esta URI:

```env
MONGO_URI=mongodb://localhost:27017/mybudget
```

## Ejecución

### Iniciar el servidor (puerto 5000)
```bash
cd server
npm run dev
```

### Iniciar el cliente (puerto 3000)
```bash
cd client
npm run dev
```

## API Endpoints

| Método | Endpoint              | Descripción                    |
|--------|----------------------|--------------------------------|
| GET    | /api/transactions    | Obtener todas las transacciones |
| POST   | /api/transactions    | Crear nueva transacción        |
| DELETE | /api/transactions/:id | Eliminar transacción           |

## Características

- ✅ Ver balance total (ingresos - gastos)
- ✅ Historial de transacciones
- ✅ Agregar nuevas transacciones (ingresos/gastos)
- ✅ Eliminar transacciones
- ✅ UI responsiva y moderna
