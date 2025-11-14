const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy data (replace with database later)
let users = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', money: 100 }
];

let plants = [
  { id: 1, name: 'Succulent', price: 20, description: 'A cute succulent' },
  { id: 2, name: 'Cactus', price: 15, description: 'A prickly friend' }
];

let tasks = [
  { id: 1, userId: 1, task: 'Study for CS exam', completed: false },
  { id: 2, userId: 1, task: 'Finish INFO project', completed: false }
];

app.get('/api/plants', (req, res) => {
  res.json({ success: true, plants });
});

// Get user data
app.get('/api/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Get user's tasks
app.get('/api/tasks/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userTasks = tasks.filter(t => t.userId === userId);
  res.json({ success: true, tasks: userTasks });
});

// ===== POST ROUTES =====

// Login (authentication - for now just checks if email exists)
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Add a new task
app.post('/api/tasks', (req, res) => {
  const { userId, task } = req.body;
  const newTask = {
    id: tasks.length + 1,
    userId,
    task,
    completed: false
  };
  tasks.push(newTask);
  res.json({ success: true, task: newTask });
});

// Send a plant to a friend
app.post('/api/plants/send', (req, res) => {
  const { senderId, recipientEmail, plantId, message } = req.body;

  // TODO: Implement email API later
  // For now, just return success
  res.json({
    success: true,
    message: 'Plant sent! (Email API not implemented yet)'
  });
});

// ===== PUT ROUTES =====

// Update user's money (after study session)
app.put('/api/user/:userId/money', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { amount } = req.body;

  const user = users.find(u => u.id === userId);
  if (user) {
    user.money += amount;
    res.json({ success: true, newBalance: user.money });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Mark task as complete
app.put('/api/tasks/:taskId/complete', (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const task = tasks.find(t => t.id === taskId);

  if (task) {
    task.completed = true;
    res.json({ success: true, task });
  } else {
    res.status(404).json({ success: false, message: 'Task not found' });
  }
});

// ===== DELETE ROUTES =====

// Delete a task (and award points)
app.delete('/api/tasks/:taskId', (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex !== -1) {
    const deletedTask = tasks.splice(taskIndex, 1)[0];

    // Award points to user
    const user = users.find(u => u.id === deletedTask.userId);
    if (user) {
      user.money += 10; // Award 10 money for completing task
    }

    res.json({
      success: true,
      message: 'Task deleted and points awarded',
      pointsAwarded: 10
    });
  } else {
    res.status(404).json({ success: false, message: 'Task not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 Plant Friends server running on http://localhost:${PORT}`);
});
