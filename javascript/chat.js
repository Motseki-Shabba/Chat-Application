// document.addEventListener("DOMContentLoaded", () => {
//   const userList = document.getElementById("user-list");
//   const chatBox = document.getElementById("chat-box");
//   const messageInput = document.getElementById("message-input");
//   const sendButton = document.getElementById("send-button");
//   const userSelect = document.getElementById("user-select");
//   const chatTitle = document.getElementById("chat-title");

//   const loggedInUser = localStorage.getItem("firstname");

//   // Redirect to login if user is not logged in
//   if (!loggedInUser) {
//     window.location.href = "login.html";
//     return;
//   }

//   // Initialize group chat if not yet present
//   if (!localStorage.getItem("groupChat")) {
//     localStorage.setItem("groupChat", JSON.stringify([]));
//   }

//   // Load active users into the sidebar
//   function loadUsers() {
//     const users = JSON.parse(localStorage.getItem("users")) || [];
//     userList.innerHTML = "";
//     users.forEach((user) => {
//       if (user.firstname !== loggedInUser) {
//         const listItem = document.createElement("li");
//         listItem.textContent = user.firstname;
//         listItem.addEventListener("click", () => {
//           userSelect.value = user.firstname;
//           loadMessages(); // Load private chat messages
//         });
//         userList.appendChild(listItem);
//       }
//     });
//   }

//   // Format the timestamp to display time
//   function formatTime(timestamp) {
//     const date = new Date(timestamp);
//     return date.toTimeString().split(" ")[0];
//   }

//   // Load messages based on selected chat
//   function loadMessages() {
//     chatBox.innerHTML = "";

//     const selectedUser = userSelect.value;
//     let messages = [];

//     if (selectedUser === "group") {
//       messages = JSON.parse(localStorage.getItem("groupChat")) || [];
//       chatTitle.textContent = "Group Chat";
//     } else {
//       const privateChatKey = `chat_${loggedInUser}_${selectedUser}`;
//       messages = JSON.parse(localStorage.getItem(privateChatKey)) || [];
//       chatTitle.textContent = `Chat with ${selectedUser}`;
//     }

//     // Display messages
//     messages.forEach((msg) => {
//       const messageElement = document.createElement("div");
//       messageElement.textContent = `${msg.sender}: ${
//         msg.text
//       } (Sent at: ${formatTime(msg.timestamp)})`;
//       messageElement.classList.add(
//         "message",
//         msg.sender === loggedInUser ? "sender" : "receiver"
//       );
//       chatBox.appendChild(messageElement);
//     });

//     chatBox.scrollTop = chatBox.scrollHeight;
//   }

//   // Save a message to localStorage
//   function saveMessage(message) {
//     const selectedUser = userSelect.value;
//     const timestamp = new Date().toISOString(); // Get current timestamp
//     let messages = [];

//     if (selectedUser === "group") {
//       messages = JSON.parse(localStorage.getItem("groupChat")) || [];
//       messages.push({ sender: loggedInUser, text: message, timestamp });
//       localStorage.setItem("groupChat", JSON.stringify(messages));
//     } else {
//       const uniqueChatKey = `chat_${loggedInUser}_${selectedUser}`;
//       messages = JSON.parse(localStorage.getItem(uniqueChatKey)) || [];
//       messages.push({ sender: loggedInUser, text: message, timestamp });
//       localStorage.setItem(uniqueChatKey, JSON.stringify(messages));
//     }
//   }

//   // Handle sending a message
//   function sendMessage() {
//     const message = messageInput.value.trim();
//     if (message) {
//       saveMessage(message);
//       loadMessages();
//       messageInput.value = "";
//     }
//   }

//   // Event listeners
//   sendButton.addEventListener("click", sendMessage);
//   messageInput.addEventListener("keypress", (event) => {
//     if (event.key === "Enter") {
//       sendMessage();
//     }
//   });
//   userSelect.addEventListener("change", loadMessages);

//   // active users and messages
//   loadUsers();
//   loadMessages();

//   // real-time updates every 3 seconds

//   setInterval(loadMessages, 3000);
// });

// // window.addEventListener("groupChat", function (event) {
// //   if (event.key === "groupChat") {
// //     // Access the updated message data from localStorage

// //     const newMessages = JSON.parse(localStorage.getItem("messages"));

// //     // Update your UI with the new messages

// //     loadMessages(message);
// //   }
// // });
document.addEventListener("DOMContentLoaded", () => {
  const userList = document.getElementById("user-list");
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const userSelect = document.getElementById("user-select");
  const chatTitle = document.getElementById("chat-title");
  const loggedInUser = localStorage.getItem("firstname");

  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("logged-in-user").textContent = loggedInUser; // Initialize group chat if not set

  if (!localStorage.getItem("groupChat")) {
    localStorage.setItem("groupChat", JSON.stringify([]));
  }

  function updateActiveUsers() {
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {}; // Remove inactive users

    const now = Date.now();
    Object.keys(activeUsers).forEach((user) => {
      if (now - activeUsers[user] > 10000) delete activeUsers[user];
    }); // Mark the current user as active

    activeUsers[loggedInUser] = now;
    localStorage.setItem("activeUsers", JSON.stringify(activeUsers)); // Notify other tabs about the update

    localStorage.setItem(
      "activeUsers_update",
      JSON.stringify({ updatedAt: now })
    );
  }

  function loadUsers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {};
    userList.innerHTML = "";
    userSelect.innerHTML = '<option value="group">Group Chat</option>';

    users.forEach((user) => {
      if (user.firstname !== loggedInUser) {
        const listItem = document.createElement("li");
        listItem.textContent = user.firstname; // Status Indicator

        const statusIndicator = document.createElement("span");
        statusIndicator.classList.add("status-indicator");
        statusIndicator.style.backgroundColor = activeUsers[user.firstname]
          ? "green"
          : "red";

        listItem.prepend(statusIndicator);
        listItem.addEventListener("click", () => selectUser(user.firstname));
        userList.appendChild(listItem); // Add to private chat dropdown

        const option = document.createElement("option");
        option.value = user.firstname;
        option.textContent = user.firstname;
        userSelect.appendChild(option);
      }
    });

    updateSelectedUser();
  }

  function selectUser(username) {
    userSelect.value = username;
    sessionStorage.setItem("selectedUser", username);
    loadMessages();
  }

  function updateSelectedUser() {
    const selectedUser = sessionStorage.getItem("selectedUser") || "group";
    userSelect.value = selectedUser;
    loadMessages();
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function loadMessages() {
    chatBox.innerHTML = "";
    const selectedUser = sessionStorage.getItem("selectedUser") || "group";
    const chatKey1 = `chat_${loggedInUser}_${selectedUser}`;
    const chatKey2 = `chat_${selectedUser}_${loggedInUser}`;
    const messages =
      selectedUser === "group"
        ? JSON.parse(localStorage.getItem("groupChat")) || []
        : JSON.parse(localStorage.getItem(chatKey1)) ||
          JSON.parse(localStorage.getItem(chatKey2)) ||
          [];

    chatTitle.textContent =
      selectedUser === "group" ? "Group Chat" : `Chat with ${selectedUser}`;

    messages.forEach((msg) => {
      const messageContainer = document.createElement("div");
      messageContainer.classList.add("message-container");

      const messageElement = document.createElement("div");
      messageElement.textContent = msg.text;
      messageElement.classList.add(
        "message",
        msg.sender === loggedInUser ? "sender" : "receiver"
      );

      const timestampElement = document.createElement("span");
      timestampElement.textContent = formatTime(msg.timestamp);
      timestampElement.classList.add("timestamp");

      messageElement.appendChild(timestampElement);
      messageContainer.appendChild(messageElement);
      chatBox.appendChild(messageContainer);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const selectedUser = sessionStorage.getItem("selectedUser") || "group";
    const timestamp = new Date().toISOString();
    const chatKey1 = `chat_${loggedInUser}_${selectedUser}`;
    const chatKey2 = `chat_${selectedUser}_${loggedInUser}`;

    let messages =
      selectedUser === "group"
        ? JSON.parse(localStorage.getItem("groupChat")) || []
        : JSON.parse(localStorage.getItem(chatKey1)) ||
          JSON.parse(localStorage.getItem(chatKey2)) ||
          [];

    messages.push({ sender: loggedInUser, text: message, timestamp });

    if (selectedUser === "group") {
      localStorage.setItem("groupChat", JSON.stringify(messages));
    } else {
      localStorage.setItem(chatKey1, JSON.stringify(messages));
      localStorage.setItem(chatKey2, JSON.stringify(messages));
    } // Notify other tabs about the new message

    localStorage.setItem(
      "chat_update",
      JSON.stringify({ user: loggedInUser, timestamp: Date.now() })
    );

    loadMessages();
    messageInput.value = "";
  }

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  userSelect.addEventListener("change", (event) => {
    sessionStorage.setItem("selectedUser", event.target.value);
    loadMessages();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "chat_update") loadMessages();
    if (event.key === "activeUsers_update") loadUsers();
  });

  document.getElementById("logout").addEventListener("click", () => {
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {};
    delete activeUsers[loggedInUser];
    localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    localStorage.removeItem("firstname"); // Notify other tabs

    localStorage.setItem(
      "activeUsers_update",
      JSON.stringify({ updatedAt: Date.now() })
    );

    window.location.replace("login-page.html");
  });

  updateActiveUsers();
  loadUsers();
});
