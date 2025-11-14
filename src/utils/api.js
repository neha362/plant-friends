const API_URL = 'http://localhost:5001/api';

export const api = {
  // GET requests
  getPlants: async () => {
    const response = await fetch(`${API_URL}/plants`);
    return response.json();
  },

  getUser: async (userId) => {
    const response = await fetch(`${API_URL}/user/${userId}`);
    return response.json();
  },

  getTasks: async (userId) => {
    const response = await fetch(`${API_URL}/tasks/${userId}`);
    return response.json();
  },

  // POST requests
  login: async (email) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  addTask: async (userId, task) => {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task })
    });
    return response.json();
  },

  // PUT requests
  updateMoney: async (userId, amount) => {
    const response = await fetch(`${API_URL}/user/${userId}/money`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return response.json();
  },

  // DELETE requests
  deleteTask: async (taskId) => {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
