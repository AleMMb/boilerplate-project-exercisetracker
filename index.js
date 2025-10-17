const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


let users = []; // almacenamiento en memoria
let exercises = []; // lista de ejercicios


app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = {username, _id: Date.now().toString()};
  users.push(newUser);
  res.json(newUser);
}); 

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id); // buscar usuario por ID
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  // extraer datos del cuerpo de la solicitud
  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date) : new Date();

  const newExercise = { // crear nuevo ejercicio
    _id: user._id,
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  exercises.push(newExercise); // agregar ejercicio a la lista
  res.json(newExercise); // responder con el nuevo ejercicio

});


app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id); // buscar usuario por ID
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(e => e._id === user._id); // filtrar ejercicios del usuario

  const { from, to, limit } = req.query; // extraer parámetros de consulta
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  } 
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }
  res.json({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises
  });
});

