const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
 const { username } = request.headers;

 const foundUser = users.find((user) => user.username === username);

 if(!foundUser){
   return response.status(404).json({ error: "User not found" });
 }
 request.user = foundUser;
 
 return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const foundUser = users.find((user) => user.username === username);
  if(foundUser){
    return response.status(400).json({error: "username já utilzado."});
  }

  const user = {
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;
  const { user } = request;
  
  const task = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline) , 
    created_at: new Date()
  }

  user.todos.push(task);
  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {id} = request.params;
  const {user} = request;
  const taskFound = user.todos.find((task) => task.id === id);

  if(!taskFound){
    return response.status(404).json({ error: "Task not found" });
  }
  
  taskFound.title = title;
  taskFound.deadline = new Date(deadline);

 return response.status(201).json(taskFound);
});



app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const taskFound = user.todos.find((task) => task.id === id);

  if(!taskFound){
    return response.status(404).json({ error: "Task not found" });
  }

  taskFound.done = true;
  return response.status(201).json(taskFound);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const taskFound = user.todos.find((task) => task.id === id);

  if(!taskFound){
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos.splice(user.todos.indexOf(taskFound), 1);

  return response.status(204).send();
});

module.exports = app;