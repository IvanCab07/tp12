import express from 'express';
import multer from 'multer';
import pool from './config/conexion.js';

const app = express();
const port = 3000;

// Configuración de multer para recibir la imagen en memoria temporal
const upload = multer({ storage: multer.memoryStorage() });
const IMGBB_API_KEY = '385c7634aedac86d2eb5819ab58fc146';

// Función ultra simple para subir la imagen a ImgBB
async function subirAImgBB(fileBuffer) {
    const formData = new URLSearchParams();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', fileBuffer.toString('base64'));

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if (data.success) return data.data.url;
    throw new Error('Error al subir imagen a ImgBB');
}

app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.send('ejemplo de api rest mysql');
});

// Obtener todas las personas
app.get('/personas', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personas');
        res.json(rows);
    } catch (error) {
        console.error("Error al consultar:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

// Obtener por ID
app.get('/personas/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personas WHERE id = ?', [req.params.id]);
        rows[0] ? res.json(rows[0]) : res.status(404).send('404');
    } catch (error) {
        console.error("Error al consultar por ID:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

// Crear registro (Sube la imagen a ImgBB si se adjunta un archivo)
app.post('/personas', upload.single('imagen'), async (req, res) => {
    try {
        const datos = req.body;

        // Si el usuario envió un archivo de imagen, lo subimos a ImgBB y guardamos su URL
        if (req.file) {
            datos.imagen = await subirAImgBB(req.file.buffer);
        }

        await pool.query('INSERT INTO personas SET ?', [datos]);
        res.status(201).send("registro creado");
    } catch (error) {
        console.log('error en la ejecucion', error);
        res.status(500).send('error en la ejecución');
    }
});

// Actualizar registro (Sube nueva imagen a ImgBB si se adjunta otra)
app.put('/personas/:id', upload.single('imagen'), async (req, res) => {
    try {
        const datos = req.body;

        if (req.file) {
            datos.imagen = await subirAImgBB(req.file.buffer);
        }

        const [result] = await pool.query('UPDATE personas SET ? WHERE id = ?', [datos, req.params.id]);
        result.affectedRows === 0 ? res.send('no existe') : res.status(200).send();
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

// Eliminar registro
app.delete('/personas/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM personas WHERE id = ?', [req.params.id]);
        result.affectedRows === 0 ? res.send('no existe') : res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).send('la pagina no existe');
});

app.listen(port, () => {
    console.log(`servidor escuchando en http://localhost:${port}`);
});
