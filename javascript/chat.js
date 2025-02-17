document.addEventListener("DOMContentLoaded", () => {
  const userList = document.getElementById("user-list");
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const userSelect = document.getElementById("user-select");
  const chatTitle = document.getElementById("chat-title");

  const loggedInUser = localStorage.getItem("firstname");

  // Redirect to login if user is not logged in
  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  // Initialize group chat if not yet present
  if (!localStorage.getItem("groupChat")) {
    localStorage.setItem("groupChat", JSON.stringify([]));
  }

  // Load active users into the sidebar
  function loadUsers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    userList.innerHTML = "";
    users.forEach((user) => {
      if (user.firstname !== loggedInUser) {
        const listItem = document.createElement("li");
        listItem.textContent = user.firstname;
        listItem.addEventListener("click", () => {
          userSelect.value = user.firstname;
          loadMessages(); // Load private chat messages
        });
        userList.appendChild(listItem);
      }
    });
  }

  // Format the timestamp to display time
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toTimeString().split(" ")[0];
  }

  // Load messages based on selected chat
  function loadMessages() {
    chatBox.innerHTML = "";

    const selectedUser = userSelect.value;
    let messages = [];

    if (selectedUser === "group") {
      messages = JSON.parse(localStorage.getItem("groupChat")) || [];
      chatTitle.textContent = "Group Chat";
    } else {
      const privateChatKey = `chat_${loggedInUser}_${selectedUser}`;
      messages = JSON.parse(localStorage.getItem(privateChatKey)) || [];
      chatTitle.textContent = `Chat with ${selectedUser}`;
    }

    // Display messages
    messages.forEach((msg) => {
      const messageElement = document.createElement("div");
      messageElement.textContent = `${msg.sender}: ${
        msg.text
      } (Sent at: ${formatTime(msg.timestamp)})`;
      messageElement.classList.add(
        "message",
        msg.sender === loggedInUser ? "sender" : "receiver"
      );
      chatBox.appendChild(messageElement);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Save a message to localStorage
  function saveMessage(message) {
    const selectedUser = userSelect.value;
    const timestamp = new Date().toISOString(); // Get current timestamp
    let messages = [];

    if (selectedUser === "group") {
      messages = JSON.parse(localStorage.getItem("groupChat")) || [];
      messages.push({ sender: loggedInUser, text: message, timestamp });
      localStorage.setItem("groupChat", JSON.stringify(messages));
    } else {
      const privateChatKey = `chat_${loggedInUser}_${selectedUser}`;
      messages = JSON.parse(localStorage.getItem(privateChatKey)) || [];
      messages.push({ sender: loggedInUser, text: message, timestamp });
      localStorage.setItem(privateChatKey, JSON.stringify(messages));
    }
  }

  // Handle sending a message
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      saveMessage(message);
      loadMessages();
      messageInput.value = "";
    }
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
  userSelect.addEventListener("change", loadMessages);

  // active users and messages
  loadUsers();
  loadMessages();
  // real-time updates every 3 seconds
  setInterval(loadMessages, 3000);
});
