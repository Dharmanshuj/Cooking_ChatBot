import React, { useState, useRef, useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {

  useEffect(() => {
    document.title = "HomePage";
  }, []);
  const [messages, setMessages] = useState([
    { type: "incoming", text: "Hi there 👋 How can I help you today?" },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const chatboxRef = useRef(null);
  const chatInputRef = useRef(null);
  const initialHeight = useRef(0);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTo(0, chatboxRef.current.scrollHeight);
    }
  }, [messages]);

  const handleChat = () => {
    if (!userMessage.trim()) return;

    const outgoingMessage = { type: "outgoing", text: userMessage };
    setMessages((prevMessages) => [...prevMessages, outgoingMessage]);
    setUserMessage("");

    setTimeout(() => {
      const incomingMessage = { type: "incoming", text: "Thinking..." };
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      generateResponse(userMessage);
    }, 600);
  };

  const generateResponse = async (message) => {
    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      console.log("Response data:", data);

      const botMessage = data.botResponse || "No response received from Gemini.";
      
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "incoming", text: botMessage },
      ]);

      // Implementing the typing effect
      let index = 0;
      const typingInterval = setInterval(() => {
        setMessages((prevMessages) => {
          const newMessage = prevMessages.slice(0, -1); // Remove "Thinking..."
          newMessage.push({
            type: "incoming",
            text: botMessage.slice(0, index + 1),
          });
          return newMessage;
        });
        index++;
        
        // Stop typing effect once the message is fully displayed
        if (index === botMessage.length) {
          clearInterval(typingInterval);
          if (chatboxRef.current) {
            chatboxRef.current.scrollTo(0, chatboxRef.current.scrollHeight);
          }
        }
      }, 100); // Adjust the delay for speed (in milliseconds)
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "incoming", text: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      if(chatboxRef.current) {
        chatboxRef.current.scrollTo(0, chatboxRef.current.scrollHeight);
      }
    }
  };

  const handleInputResize = () => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = `${initialHeight.current}px`;
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={'show-chatbot'}>
      <div style={{ width: "80%", height: 0, paddingBottom: "50%", position: "relative" }}>
      <iframe
        src="https://giphy.com/embed/88jA28HLAc0VIqeY3G"
        width="40%"
        height="80%"
        style={{ position: "absolute", border: "none" }}
        className="giphy-embed"
        allowFullScreen
        title="Chatbot animation"
      ></iframe>
    </div>
        <div className="chatbot">
          <header>
            <h2>Chatbot</h2>
          </header>
          <ul className="chatbox" ref={chatboxRef}>
            {messages.map((msg, index) => (
              <li key={index} className={`chat ${msg.type}`}>
                {msg.type === "incoming" && (
                  <span className="material-icons">smart_toy</span>
                )}
                <p>{msg.text}</p>
              </li>
            ))}
          </ul>
          <div className="chat-input">
            <textarea
              ref={chatInputRef}
              placeholder="Enter a message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onInput={handleInputResize}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
            />
          </div>
        </div>
    </div>
  );
};

export default HomePage;