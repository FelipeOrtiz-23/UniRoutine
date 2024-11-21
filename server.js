const express = require('express');
const mysql = require('mysql'); // O 'pg' si usas PostgreSQL
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const upload = multer({ dest: 'uploads/' }); // Directorio de subida
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración para el body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración para manejar sesiones
app.use(session({
    secret: 'mi_secreto', // Cambia este secreto en producción
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Configuración para cookies no seguras (para desarrollo)
}));

// Conexión a la base de datos (MySQL en este ejemplo)
const pool = mysql.createPool({
    host: 'localhost', // Cambia según tu configuración
    user: 'root',
    password: 'password', // Asegúrate de reemplazarlo con tu contraseña
    database: 'task_management'
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal (login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas para cada una de las páginas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/task', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'task.html'));
});

app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

// Endpoint para agregar una tarea
app.post('/tasks', (req, res) => {
    const { task_name, task_type, task_priority, task_status, task_date, task_duration } = req.body;
    const query = 'INSERT INTO tasks (task_name, task_type, task_priority, task_status, task_date, task_duration) VALUES (?, ?, ?, ?, ?, ?)';
    
    pool.query(query, [task_name, task_type, task_priority, task_status, task_date, task_duration], (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: 'Database insert failed' });
        }
        res.json({ taskId: results.insertId }); // Responder con el ID de la tarea creada
    });
});

// Endpoint para subir un documento
app.post('/upload', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha subido ningún archivo.');
    }
    res.send(`Archivo subido: ${req.file.originalname}`);
});

// Ruta adicional de bienvenida a la API
app.get('/welcome', (req, res) => {
    res.send('Welcome to the Task Management API!');
});

// Ruta para el login (autenticación)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validar que se recibieron los datos
    if (!username || !password) {
        return res.status(400).send('Nombre de usuario o contraseña incorrectos');
    }

    // Consultar si el usuario existe en la base de datos
    const query = 'SELECT * FROM users WHERE username = ?';
    pool.query(query, [username], async (error, results) => {
        if (error) {
            console.error('Error al consultar usuario:', error);
            return res.status(500).send('Error al consultar usuario');
        }

        if (results.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        // Verificar si la contraseña es correcta
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Iniciar sesión (guardar el ID del usuario en la sesión)
        req.session.userId = user.id;
        res.redirect('/dashboard'); // Redirigir al dashboard o página principal
    });
});

// Ruta para el registro de usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validación de los datos
    if (!username || !password) {
        return res.status(400).send('Nombre de usuario o contraseña faltante');
    }

    // Cifrar la contraseña antes de guardarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error al cifrar la contraseña');
        }

        // Insertar el nuevo usuario en la base de datos
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        pool.query(query, [username, hashedPassword], (error, results) => {
            if (error) {
                console.error(error.message);
                return res.status(500).send('Error al registrar el usuario');
            }
            res.send('Usuario registrado con éxito');
        });
    });
});

// Ruta para el dashboard (página principal después de login)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Si no está autenticado, redirigir a login
    }
    res.send('<h1>Bienvenido al Dashboard</h1><a href="/logout">Cerrar sesión</a>');
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('No se pudo cerrar la sesión');
        }
        res.redirect('/login');
    });
});

// Agregar un endpoint para obtener todas las tareas
app.get('/api/tasks', (req, res) => {
    const query = 'SELECT * FROM tasks';
    pool.query(query, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: 'Error al obtener las tareas' });
        }
        res.json(results);
    });
});

// Agregar un endpoint para obtener todos los eventos
app.get('/api/events', (req, res) => {
    const query = 'SELECT * FROM events';
    pool.query(query, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: 'Error al obtener los eventos' });
        }
        res.json(results);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
