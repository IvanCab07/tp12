import express from 'express';
import pool from './config/conexion.js';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ejemplo de api rest mysql');
});

app.get('/personas', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personas');
        res.json(rows);
    } catch (error) {
        console.error("Error al consultar:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

app.get('/personas/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personas WHERE id = ?', [req.params.id]);
        rows[0] ? res.json(rows[0]) : res.status(404).send('404');
    } catch (error) {
        console.error("Error al consultar por ID:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

app.post('/personas', async (req, res) => {
    try {
        await pool.query('INSERT INTO personas SET ?', [req.body]);
        res.status(201).send("registro creado");
    } catch (error) {
        console.log('error en la ejecucion', error);
        res.status(500).send('error en la ejecucion');
    }
});

app.put('/personas/:id', async (req, res) => {
    try {
        const [result] = await pool.query('UPDATE personas SET ? WHERE id = ?', [req.body, req.params.id]);
        result.affectedRows === 0 ? res.send('no existe') : res.status(200).send();
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

app.delete('/personas/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM personas WHERE id = ?', [req.params.id]);
        result.affectedRows === 0 ? res.send('no existe') : res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).send("error, no se pudo realizar la consulta");
    }
});

app.use((req, res) => {
    res.status(404).send('la pagina no existe');
});

app.listen(port, () => {
    console.log(`servidor escuchando en http://localhost:${port}`);
});
