// Login page

// Already logged in? Go to the dashboard
if (currentUser()) {
  location.replace('dashboard.html');
}

// Page elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorBox      = document.getElementById('error');
const loginButton   = document.getElementById('login-button');

// Log in, or show an error
function tryLogin() {
  if (login(usernameInput.value, passwordInput.value)) {
    location.href = 'dashboard.html';
  } else {
    errorBox.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
  }
}

// Log in when the button is clicked
loginButton.onclick = tryLogin;

// Log in when Enter is pressed
[usernameInput, passwordInput].forEach(function (input) {
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') tryLogin();
  });
});
