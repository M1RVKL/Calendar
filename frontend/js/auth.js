import { login, register, saveToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleSignup = document.getElementById('toggle-signup');
  const toggleSignin = document.getElementById('toggle-signin');
  const formTitle = document.getElementById('form-title');
  const authMessage = document.getElementById('auth-message');
  const googleSignin = document.getElementById('google-signin');
  const forgotPassword = document.getElementById('forgot-password');

  toggleSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    toggleSignup.style.display = 'none';
    toggleSignin.style.display = 'inline';
    formTitle.textContent = 'Sign Up';
    authMessage.textContent = '';
  });
  toggleSignin.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    toggleSignup.style.display = 'inline';
    toggleSignin.style.display = 'none';
    formTitle.textContent = 'Sign In';
    authMessage.textContent = '';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = 'Logging in...';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const res = await login(email, password);
      if (res.token) {
        saveToken(res.token);
        window.location.href = 'calendar.html';
      } else {
        authMessage.textContent = res.message || 'Login failed.';
      }
    } catch (err) {
      authMessage.textContent = 'Login error.';
    }
  });
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = 'Registering...';
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    try {
      const res = await register(email, password);
      if (res.message === 'User registered') {
        authMessage.textContent = 'Registration successful! Please sign in.';
        setTimeout(() => {
          toggleSignin.click();
        }, 1000);
      } else {
        authMessage.textContent = res.message || 'Registration failed.';
      }
    } catch (err) {
      authMessage.textContent = 'Registration error.';
    }
  });
  googleSignin.addEventListener('click', (e) => {
    e.preventDefault();
    authMessage.textContent = 'Google sign-in not implemented yet.';
  });
  forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    authMessage.textContent = 'Password reset not implemented yet.';
  });
}); 