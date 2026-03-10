const screens = document.querySelectorAll(".screen");
const screenButtons = document.querySelectorAll("[data-screen]");

function showScreen(screenId) {
  screens.forEach((screen) => screen.classList.remove("active"));

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }

  clearMessages();
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const screenId = button.getAttribute("data-screen");
    showScreen(screenId);
  });
});

function clearMessages() {
  document.querySelectorAll(".message").forEach((box) => {
    box.className = "message";
    box.textContent = "";
  });
}

function showMessage(id, text, type) {
  const box = document.getElementById(id);
  box.textContent = text;
  box.className = `message show ${type}`;
}

document.querySelectorAll(".toggle-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      this.textContent = "Hide";
    } else {
      input.type = "password";
      this.textContent = "Show";
    }
  });
});

function getUsers() {
  return JSON.parse(localStorage.getItem("budgetFlowUsers")) || [];
}

function saveUsers(users) {
  localStorage.setItem("budgetFlowUsers", JSON.stringify(users));
}

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearMessages();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const acceptedTerms = document.getElementById("terms-checkbox").checked;

  if (!name || !email || !password || !confirmPassword) {
    showMessage("signup-message", "Please complete all fields.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("signup-message", "Password must be at least 6 characters long.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("signup-message", "Passwords do not match.", "error");
    return;
  }

  if (!acceptedTerms) {
    showMessage("signup-message", "You must agree to the terms and policy.", "error");
    return;
  }

  const users = getUsers();
  const userExists = users.some((user) => user.email === email);

  if (userExists) {
    showMessage("signup-message", "An account with this email already exists.", "error");
    return;
  }

  users.push({
    name,
    email,
    password
  });

  saveUsers(users);
  signupForm.reset();

  showMessage("signup-message", "Registration successful. Redirecting to login...", "success");

  setTimeout(() => {
    showScreen("login-screen");
  }, 1200);
});

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearMessages();

  const loginName = document.getElementById("login-name").value.trim();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;
  const remember = document.getElementById("remember-me").checked;

  if (!loginName || !email || !password) {
    showMessage("login-message", "Please enter your full name, email and password.", "error");
    return;
  }

  const users = getUsers();
  const matchedUser = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!matchedUser) {
    showMessage("login-message", "Invalid login details.", "error");
    return;
  }

  localStorage.setItem(
    "budgetFlowCurrentUser",
    JSON.stringify({
      name: matchedUser.name,
      email: matchedUser.email,
      rememberMe: remember
    })
  );

  loginForm.reset();
  showMessage("login-message", "Login successful. Your page is working.", "success");

  // Later, replace this with:
  // window.location.href = "../pages/dashboard.html";
});

const forgotForm = document.getElementById("forgot-form");

forgotForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById("forgot-email").value.trim().toLowerCase();
  const users = getUsers();
  const foundUser = users.some((user) => user.email === email);

  if (!email) {
    showMessage("forgot-message", "Please enter your email address.", "error");
    return;
  }

  if (!foundUser) {
    showMessage("forgot-message", "No account was found with that email.", "error");
    return;
  }

  forgotForm.reset();
  showScreen("success-screen");
});