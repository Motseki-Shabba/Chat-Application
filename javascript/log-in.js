function logIn(event) {
  event.preventDefault();
  let firstname, password;

  //Getting user input values

  firstname = document.getElementById("firstname").value;
  password = document.getElementById("password").value; //Restoring stored users from the LocalStorage or return empty array

  let logInRecords = JSON.parse(localStorage.getItem("users")) || []; //Finding the user with matching credentials

  const loggedInUser = logInRecords.find(
    (user) => user.firstname === firstname && user.password === password
  );

  if (loggedInUser) {
    //login successful and redirect to chat panel
    alert("Login Successful");

    localStorage.setItem("firstname", loggedInUser.firstname);
    localStorage.setItem("lastname", loggedInUser.lastname);
    localStorage.setItem("email", loggedInUser.email);
    window.location.href = "chat-panel.html";
  } else {
    //else, tell the user to check the credentials correctly
    alert("Login failed. Please check your login credentials");
  }
}
