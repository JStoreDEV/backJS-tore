import express from 'express';
import pg from 'pg';
const { Pool } = pg;

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

const app = express();
const router = express.Router();

// Middleware para procesar JSON y formularios URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const isAdmin = (req, res, next) => {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
  
    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres un administrador' });
    }
  
    // Si el usuario es autenticado y es administrador, permitir el acceso a la ruta
    next();
  };
  

// Ruta para obtener todos los usuarios
router.get('/users',  isAdmin,  async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM js_user');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
});

// Ruta para autenticar a un usuario
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM js_user WHERE username = $1 AND password = $2', [username, password]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error('Error al autenticar al usuario:', error);
        res.status(500).json({ error: 'Error al autenticar al usuario' });
    }
});

// Montar las rutas en la aplicación
app.use('/', router);

// Arrancar el servidor en el puerto 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
