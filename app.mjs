import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import routes from './routes/routes.js';

const app = express();


// Configuración de la conexión a la base de datos
const pool = new Pool({
    user: 'fl0user',
    host: 'ep-weathered-fire-19026024.us-east-2.aws.neon.fl0.io',
    database:'prod-jire-store',
    password: 'xbB0zMYWH6VK',
    ssl: true
});


// Manejo de errores en la conexión a la base de datos
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000'
  }));
  
// Montar las rutas en la aplicación
app.use('/api', routes(pool));

// Arrancar el servidor en el puerto 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
