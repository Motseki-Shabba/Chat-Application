function logIn(event) {
  event.preventDefault();
  let firstname = document.getElementById("firstname").value;
  let password = document.getElementById("password").value;
  let errorMessage = document.getElementById("error-message"); // Check if the fields are empty

  if (!firstname || !password) {
    errorMessage.textContent = "Both fields are required.";
    errorMessage.style.display = "block";
    return;
  }

  // Check password length
  if (password.length < 2) {
    errorMessage.textContent = "Password must be at least 6 characters.";
    errorMessage.style.display = "block";
    return;
  }

  // Restoring stored users from the LocalStorage or return empty array
  let logInRecords = JSON.parse(localStorage.getItem("users")) || [];

  // Finding the user with matching credentials
  const loggedInUser = logInRecords.find(
    (user) => user.firstname === firstname && user.password === password
  );

  if (loggedInUser) {
    // login successful and redirect to chat panel
    alert("Login Successful");

    localStorage.setItem("firstname", loggedInUser.firstname);
    localStorage.setItem("lastname", loggedInUser.lastname);
    localStorage.setItem("email", loggedInUser.email);
    window.location.href = "chat-panel.html";
  } else {
    // login failed
    alert("Login failed. Please check your login credentials");
  }
}

// Attach event listener for form submission
document.getElementById("login-form").addEventListener("submit", logIn);
