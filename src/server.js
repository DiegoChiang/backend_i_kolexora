const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db.config');
const { setSocketServer } = require('./utils/socketServer');

const PORT = process.env.PORT || 8080;

const httpServer = http.createServer(app);
const io = new Server(httpServer);

setSocketServer(io);

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
