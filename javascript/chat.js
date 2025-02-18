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
