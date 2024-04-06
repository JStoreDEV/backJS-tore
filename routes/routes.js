import express from 'express';
import { isAdmin } from '../utils/authUtils.js';


const router = express.Router();

export default function setupRoutes(pool) {
    // Ruta para obtener todos los usuarios
    router.get('/users', isAdmin, async (req, res) => {
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

    // Ruta para obtener todos los productos
    router.get('/producto', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT js_producto.*, js_categoria.nombre_categoria AS nombre_categoria
                FROM js_producto
                JOIN js_categoria ON js_producto.categoria_id = js_categoria.id
            `);

            // Verificar y convertir las imágenes a base64 si son Buffer válidos
            const productosConImagenBase64 = result.rows.map(producto => {
                if (Buffer.isBuffer(producto.images)) {
                    // Convertir el Buffer a base64 y luego a una URL base64
                    return {
                        ...producto,
                        images: `${producto.images}`
                    };
                } else {
                    // Si el campo 'images' no es un Buffer válido, proporcionar un valor predeterminado
                    console.error('Error: El campo "images" no es un Buffer válido:', producto);
                    return {
                        ...producto,
                        images: '' // Proporciona un valor predeterminado o vacío
                    };
                }
            });

            res.json(productosConImagenBase64);
        } catch (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
    });


// Ruta para agregar un nuevo producto
router.post('/producto', async (req, res) => {
    const { nombre_producto, producto_slug, descripcion, precio, imagenBase64, stock, is_available, create_date, categoria_id } = req.body;

    try {
        // Insertar datos en la base de datos, incluyendo la imagen base64
        await pool.query('INSERT INTO js_producto (nombre_producto, producto_slug, descripcion, precio, images, stock, is_available, create_date, modified_date, categoria_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9)', [nombre_producto, producto_slug, descripcion, precio, imagenBase64, stock, is_available, create_date, categoria_id]);
        
        res.status(201).json({ message: 'Producto agregado correctamente' });
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});




    // Ruta para actualizar un producto existente
    router.put('/productos/:id', isAdmin, async (req, res) => {
        const id = req.params.id;
        const { nombre_producto, producto_slug, descripcion, precio, images, stock, is_available, create_date, categoria_id } = req.body;

        try {
            // Aquí realizar la actualización del producto
            await pool.query('UPDATE js_producto SET nombre_producto = $1, producto_slug = $2, descripcion = $3, precio = $4, images = $5, stock = $6, is_available = $7, create_date = $8, categoria_id = $9 WHERE id = $10', [nombre_producto, producto_slug, descripcion, precio, images, stock, is_available, create_date, categoria_id, id]);

            res.json({ message: 'Producto actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    });

    // Ruta para eliminar un producto existente
    router.delete('/productos/:id', isAdmin, async (req, res) => {
        const id = req.params.id;

        try {
            await pool.query('DELETE FROM js_producto WHERE id = $1', [id]);

            res.json({ message: 'Producto eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            res.status(500).json({ error: 'Error al eliminar el producto' });
        }
    });

    // Ruta para obtener todas las categorías
    router.get('/categorias', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM js_categoria');

            const categoriaConImagenBase64 = result.rows.map(categoria => {
                if (categoria.cat_image !== null && Buffer.isBuffer(categoria.cat_image)) {
                    // Convertir el Buffer a base64
                    const base64Image = categoria.cat_image.toString('base64');
                    // Devolver el objeto con la imagen convertida a base64
                    return {
                        ...categoria,
                        cat_image: base64Image
                    };
                } else if (categoria.cat_image === null) {
                    // Si el campo 'cat_image' es null, proporcionar un valor predeterminado
                    return {
                        ...categoria,
                        cat_image: '' // Proporciona un valor predeterminado o vacío
                    };
                } else {
                    // Si el campo 'cat_image' no es un Buffer válido, proporcionar un valor predeterminado
                    console.error('Error: El campo "cat_image" no es un Buffer válido:', categoria);
                    return {
                        ...categoria,
                        cat_image: '' // Proporciona un valor predeterminado o vacío
                    };
                }
            });

            res.json(categoriaConImagenBase64); // Selecciona las filas del resultado y las envía como respuesta
        } catch (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
    });
    

    return router;
}
