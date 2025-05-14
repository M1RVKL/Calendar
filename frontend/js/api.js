const API_BASE = 'http://localhost:5000/api';

function saveToken(token) {
  localStorage.setItem('jwt', token);
}
function getToken() {
  return localStorage.getItem('jwt');
}
function removeToken() {
  localStorage.removeItem('jwt');
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function getEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

async function createEvent(event) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(event)
  });
  return res.json();
}

async function updateEvent(id, event) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(event)
  });
  return res.json();
}

async function deleteEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

export {
  login,
  register,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  saveToken,
  getToken,
  removeToken
}; 