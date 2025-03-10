"use client";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const Chat = ({ currentUserId }) => {
  const socketRef = useRef(null); // Store socket instance
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000/api/socket");
    }

    const socket = socketRef.current;
socket.io.opts.transports = ["websocket"]; 
socket.io.opts.query = { debug: true }; 

    // Fetch users
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        const filteredUsers = data.filter((user) => user._id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();

    // Socket event listeners
    socket.on("connect", () => {
      console.log("WebSocket connected with ID:", socket.id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    socket.on("receive_message", (messageData) => {
      console.log("Received message:", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    socket.on("disconnect", (reason) => {
        console.log("User disconnected");
        if (reason) {
          console.log("Reason for disconnect:", reason);
        } else {
          console.log("No specific reason provided for disconnect.");
        }
        setSocketConnected(false);
      });      

    socket.emit("register_user", currentUserId);

  }, [currentUserId]);

  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      const messageData = {
        fromUser: currentUserId,
        toUser: selectedUser._id,
        message,
      };

      if (socketConnected) {
        console.log("Emitting message:", messageData);
        socketRef.current.emit("send_message", messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
      } else {
        console.error("Socket is not connected when trying to send the message!");
      }

      setMessage(""); // Clear input
    }
  };

  return (
    <div className="chat-container">
      <div className="user-list">
        <h3>Select a User to Chat With</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => setSelectedUser(user)}
              style={{
                cursor: "pointer",
                fontWeight: selectedUser?._id === user._id ? "bold" : "normal",
                background: selectedUser?._id === user._id ? "#ddd" : "transparent",
              }}
            >
              {user.name || user.email}
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && (
        <div className="chat-box">
          <h3>Chat with {selectedUser.name || selectedUser.email}</h3>
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={msg.fromUser === currentUserId ? "sent" : "received"}>
                <p>
                  <strong>
                    {msg.fromUser === currentUserId ? "You" : selectedUser.name}:
                  </strong>{" "}
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage} disabled={!socketConnected}>
              {socketConnected ? "Send" : "Connecting..."}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
