document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("firstname");
  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find((u) => u.firstname === loggedInUser);

  if (user) {
    document.getElementById("firstname").value = user.firstname;
    document.getElementById("lastname").value = user.lastname;
    document.getElementById("email").value = user.email;
    document.getElementById("password").value = user.password;
  }
});

window.updateProfile = function () {
  const updatedUser = {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let index = users.findIndex(
    (u) => u.firstname === localStorage.getItem("firstname")
  );
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("firstname", updatedUser.firstname);
    alert("Profile updated successfully!");
    window.location.replace("chat-panel.html");
  }
};
