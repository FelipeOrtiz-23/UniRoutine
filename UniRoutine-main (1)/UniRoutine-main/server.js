require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files
app.use(express.urlencoded({ extended: true })); 

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Endpoint para redirigir a login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Redirigir al archivo login.html
});

// Endpoint to get tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Endpoint to add a new task
app.post('/tasks', async (req, res) => {
    const { title, description, date, duration, priority, category, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, date, duration, priority, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description, date, duration, priority, category, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Endpoint to delete a task
app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(204).send(); // No content
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Endpoint para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);    
    if (username === 'admin' && password === 'admin123') {
        res.redirect('/admin_dashboard.html'); // Redirigir al panel de administrador
    } else if (username === 'user' && password === 'user123') {
        res.redirect('/user_dashboard.html'); // Redirigir al panel de usuario
    } else {
        res.send('Credenciales incorrectas. Inténtalo de nuevo.'); // Mensaje de error
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
