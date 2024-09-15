import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

let socket;
const CONNECTION_PORT = "http://localhost:3001/";

function App() {
  // Before Login
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState("");
  const [userName, setUserName] = useState("");

  // After Login
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // Establish socket connection once when the component mounts
  useEffect(() => {
    socket = io(CONNECTION_PORT);

    return () => {
      socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }, []); // Runs once when component mounts, and cleans up on unmount

  // Listen for messages and update the message list
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((prevList) => [...prevList, data]);
    });

    return () => {
      socket.off("receive_message"); // Clean up listener on unmount
    };
  }, []); // Empty dependency array, we only need this listener set up once

  const connectToRoom = () => {
    if (room !== "" && userName !== "") {
      setLoggedIn(true);
      socket.emit("join_room", room);
    }
  };

  const sendMessage = async () => {
    if (message !== "") {
      let messageContent = {
        room: room,
        content: {
          author: userName,
          message: message,
        },
      };

      await socket.emit("send_message", messageContent);
      setMessageList((prevList) => [...prevList, messageContent.content]);
      setMessage(""); // Clear the input after sending
    }
  };

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="logIn">
          <div className="inputs">
            <input
              type="text"
              placeholder="Name..."
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Room..."
              onChange={(e) => {
                setRoom(e.target.value);
              }}
            />
          </div>
          <button onClick={connectToRoom}>Enter Chat</button>
        </div>
      ) : (
        <div className="chatContainer">
          <div className="messages">
            {messageList.map((val, key) => {
              return (
                <div
                  className="messageContainer"
                  id={val.author === userName ? "You" : "Other"}
                  key={key} // Unique key prop
                >
                  <div className="messageIndividual">
                    {val.author}: {val.message}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="messageInputs">
            <input
              type="text"
              placeholder="Message..."
              value={message} // Add value to input to clear it after sending
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
