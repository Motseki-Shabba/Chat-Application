function signUp() {
  let firstname, lastname, email, password;

  firstname = document.getElementById("firstname").value;
  lastname = document.getElementById("lastname").value;
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;

  let signUpUsers_Records = new Array();

  signUpUsers_Records = JSON.parse(localStorage.getItem("users"))
    ? JSON.parse(localStorage.getItem("users"))
    : [];

  if (
    signUpUsers_Records.some((n) => {

    })
  ) {
    alert("User exists");
  } else {
    signUpUsers_Records.push({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
    });

    localStorage.setItem("users", JSON.stringify(signUpUsers_Records));
  }
}
