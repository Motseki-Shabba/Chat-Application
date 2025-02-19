function signUp(event) {
  event.preventDefault();
  // Getting user input values
  let firstname = document.getElementById("firstname").value;
  let lastname = document.getElementById("lastname").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let errorMessage = document.getElementById("error-message");

  // Validation checks

  if (!firstname || !lastname || !email || !password) {
    errorMessage.textContent = "All fields are required.";
    errorMessage.style.display = "block";
    return;
  }

  // Check for valid email format

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailPattern.test(email)) {
    errorMessage.textContent = "Please enter a valid email address.";
    errorMessage.style.display = "block";
    return;
  }
  // Check password length at least 3 characters

  if (password.length < 3) {
    errorMessage.textContent = "Password must be at least 6 characters.";
    errorMessage.style.display = "block";
    return;
  }
  // Retrieve existing users from localStorage or initialize empty array

  let signUpUsers_Records = JSON.parse(localStorage.getItem("users")) || []; // Check if the user already exists

  if (signUpUsers_Records.some((n) => n.firstname === firstname)) {
    errorMessage.textContent = "User with this first name already exists.";
    errorMessage.style.display = "block";
    return;
  }
  // Add the new user to the records

  signUpUsers_Records.push({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
  });
  // Save updated users to localStorage

  localStorage.setItem("users", JSON.stringify(signUpUsers_Records));
  // Successful sign-up

  alert("Sign-up successful! You can now log in.");
  window.location.href = "pages/login-page.html";
}

// event listener for form submission
document.getElementById("sign-up-form").addEventListener("submit", signUp);
