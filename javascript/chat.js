// Event listener for when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get necessary elements by their ID
  const userList = document.getElementById("user-list");
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const userSelect = document.getElementById("user-select");
  const chatTitle = document.getElementById("chat-title");
  // Get the logged-in user's first name from localStorage

  const loggedInUser = localStorage.getItem("firstname");

  // Redirect to the login page if no user is logged in

  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  } // Display the logged-in user's name on the page

  document.getElementById("logged-in-user").textContent = loggedInUser;
  // Initialize group chat if not already set in localStorage

  if (!localStorage.getItem("groupChat")) {
    localStorage.setItem("groupChat", JSON.stringify([]));
  }
  // Function to update the list of active users

  function updateActiveUsers() {
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {};
    // Remove inactive users (users who haven't been active in the last 10 seconds)

    const now = Date.now();
    Object.keys(activeUsers).forEach((user) => {
      if (now - activeUsers[user] > 10000) delete activeUsers[user];
    });
    // Mark the current user as active

    activeUsers[loggedInUser] = now;
    localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    // Notify other tabs about the active users update

    localStorage.setItem(
      "activeUsers_update",
      JSON.stringify({ updatedAt: now })
    );
  }
  // Function to load the list of users (and display them in the UI)

  function loadUsers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {};

    userList.innerHTML = "";
    userSelect.innerHTML = '<option value="group">Group Chat</option>';

    // Add each user to the list and dropdown (excluding the logged-in user)

    users.forEach((user) => {
      if (user.firstname !== loggedInUser) {
        const listItem = document.createElement("li");
        listItem.textContent = user.firstname;

        // Create a status indicator (green for active, red for inactive)

        const statusIndicator = document.createElement("span");
        statusIndicator.classList.add("status-indicator");
        statusIndicator.style.backgroundColor = activeUsers[user.firstname]
          ? "green"
          : "red";

        listItem.prepend(statusIndicator);
        listItem.addEventListener("click", () => selectUser(user.firstname));
        userList.appendChild(listItem);

        // Add to the private chat dropdown

        const option = document.createElement("option");
        option.value = user.firstname;
        option.textContent = user.firstname;
        userSelect.appendChild(option);
      }
    });

    // Load messages for the selected user

    updateSelectedUser();
  }

  // Function to handle user selection for private chat

  function selectUser(username) {
    userSelect.value = username;
    sessionStorage.setItem("selectedUser", username);
    loadMessages();
  }

  // Function to update the selected user (or group chat)

  function updateSelectedUser() {
    const selectedUser = sessionStorage.getItem("selectedUser") || "group";
    userSelect.value = selectedUser;
    loadMessages();
  }

  // Function to format the timestamp of a message

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Function to load the chat messages for the selected user or group

  function loadMessages() {
    chatBox.innerHTML = ""; // Clear the chat box
    const selectedUser = sessionStorage.getItem("selectedUser") || "group";

    // Define chat keys for group and private chats

    const chatKey1 = `chat_${loggedInUser}_${selectedUser}`;
    const chatKey2 = `chat_${selectedUser}_${loggedInUser}`;

    // Get the chat messages from localStorage (either group chat or private chat)
    const messages =
      selectedUser === "group"
        ? JSON.parse(localStorage.getItem("groupChat")) || []
        : JSON.parse(localStorage.getItem(chatKey1)) ||
          JSON.parse(localStorage.getItem(chatKey2)) ||
          [];

    // Update chat title

    chatTitle.textContent =
      selectedUser === "group" ? "Group Chat" : `Chat with ${selectedUser}`;

    // Display each message in the chat box

    messages.forEach((msg) => {
      const messageContainer = document.createElement("div");
      messageContainer.classList.add("message-container");

      const senderName = document.createElement("span");
      senderName.textContent = msg.sender;
      senderName.classList.add("sender-name");
      messageContainer.appendChild(senderName);

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

    // Scroll chat box to show the latest message

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Function to send a new message

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const selectedUser = sessionStorage.getItem("selectedUser") || "group";
    const timestamp = new Date().toISOString();
    const chatKey1 = `chat_${loggedInUser}_${selectedUser}`;
    const chatKey2 = `chat_${selectedUser}_${loggedInUser}`;

    // Get existing messages for the selected chat

    let messages =
      selectedUser === "group"
        ? JSON.parse(localStorage.getItem("groupChat")) || []
        : JSON.parse(localStorage.getItem(chatKey1)) ||
          JSON.parse(localStorage.getItem(chatKey2)) ||
          [];

    // Add the new message to the messages array

    messages.push({ sender: loggedInUser, text: message, timestamp });

    // Save the updated messages to localStorage

    if (selectedUser === "group") {
      localStorage.setItem("groupChat", JSON.stringify(messages));
    } else {
      localStorage.setItem(chatKey1, JSON.stringify(messages));
      localStorage.setItem(chatKey2, JSON.stringify(messages));
    }

    // Notify other tabs about the new message

    localStorage.setItem(
      "chat_update",
      JSON.stringify({ user: loggedInUser, timestamp: Date.now() })
    );

    // Reload messages and clear the input field

    loadMessages();
    messageInput.value = "";
  }

  // Event listeners for sending messages

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  // Event listener for selecting a user or group for chat

  userSelect.addEventListener("change", (event) => {
    sessionStorage.setItem("selectedUser", event.target.value);
    loadMessages();
  });

  // Event listener for storage changes (for cross-tab communication)

  window.addEventListener("storage", (event) => {
    if (event.key === "chat_update") loadMessages();
    if (event.key === "activeUsers_update") loadUsers();
  });

  // Event listener for logging out

  document.getElementById("logout").addEventListener("click", () => {
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {};
    delete activeUsers[loggedInUser]; // Remove logged-out user from active users list
    localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    localStorage.removeItem("firstname");

    // Remove user info from localStorage // Notify other tabs about the active users update

    localStorage.setItem(
      "activeUsers_update",
      JSON.stringify({ updatedAt: Date.now() })
    );

    // Redirect to the login page

    window.location.href = "login.html";
  });
  // Initialize active users and load the user list

  updateActiveUsers();
  loadUsers();
});
