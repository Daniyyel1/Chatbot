"use client";
import React, { useEffect, useRef, useState } from "react";
import chatbot from "../../public/chatbot.png";
import Image from "next/image";
import { Send } from "lucide-react";
import robot from "../../public/robot.png";
import user from "../../public/user.png";
import { openDB } from "idb";

const Chatbot = () => {
  const DB_NAME = "chatbotDB";
  const STORE_NAME = "messages";

  const [chatMessages, setChatMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hello! i am Bobo AI! what can i help you with today?",
      sender:'robot',
      chatTime: Date.now(),
    },
  ]);

  async function initDB() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
        }
      },
    });
  }

  // useEffect(() => {
  //   (async () => {
  //     const db = await initDB();
  //     const allMsgs = await db.getAll(STORE_NAME);

  //     // setChatMessages((prevState) => [...prevState, allMsgs])
  //     // allMsgs.length > 0 ? setChatMessages((prevState) => [...prevState, allMsgs]) : setChatMessages((prevState) => [...prevState])
  //   })();
  // }, []);

  useEffect(() => {
    (async () => {
      const db = await initDB();
      const allMsgs = await db.getAll(STORE_NAME);
      if (allMsgs.length > 0) {
        setChatMessages(allMsgs);
      }
    })();
  }, []);

  console.log(chatMessages);

  const saveMessage = async (msg) => {
    const db = await initDB();
    await db.add(STORE_NAME, msg);
  };

  const clearChat = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME); // clear all saved messages
    setChatMessages([]);
  };
  const [inputText, setInputText] = useState("");

  const saveInputText = (e) => {
    setInputText(e.target.value);
    console.log(e.target.value);
  };

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new message comes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputText,
      sender: "user",
      chatTime: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    saveMessage(userMessage);

    const isThinking = {
      id: "thinking",
      role: "assistant",
      content: "Thinking...",
      sender: "robot",
    };

    setChatMessages((prev) => [...prev, isThinking]);
    // setChatMessages((prev) => [...prev, isThinking])

    setInputText("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMessages, userMessage] }),
      });

      const data = await res.json();
      if (data.reply) {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === "thinking"
              ? {
                  ...data.reply,
                  id: crypto.randomUUID(),
                  role: "assistant",
                  sender: "robot",
                  chatTime: Date.now(),
                }
              : msg
          )
        );
      }
      await saveMessage(data.reply);
    } catch (error) {
      console.error(error);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === "thinking"
            ? {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, something went wrong.",
                sender: "robot",
                chatTime: Date.now(),
              }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex items-center justify-center flex-row mx-auto">
      <div className="px-3 flex items-center justify-center flex-col h-screen bg-[#a8c7fa] max-sm:hidden max-w-[225px]">
        <Image
          className="h-45 w-full object-contain"
          src={chatbot}
          alt="chatbot"
        />
      </div>

      <div className="w-full h-screen  bg-[#020e42] py-2.5 pt-5 relative px-4 overflow-y-auto">
        <h1
          className="text-center 
             lg:text-2xl 
             md:text-xl 
             sm:text-lg text-gray-100 font-bold"
        >
          Chatbot AI
        </h1>
        <div className="">
          {chatMessages.map((chatMessage, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                chatMessage.sender === "user"
                  ? "justify-start items-center"
                  : "justify-end items-center"
              }`}
            >
              {chatMessage.sender === "user" && (
                <Image
                  src={user}
                  alt="user"
                  width={30}
                  className="h-8 w-8 rounded-[50%] object-cover"
                ></Image>
              )}

              {chatMessage.sender === "robot" && (
                <Image
                  src={robot}
                  alt="robot"
                  width={30}
                  className="h-8 w-8 rounded-[50%] object-cover"
                ></Image>
              )}

              <div
                className={`p-2 rounded-lg max-w-lg max-sm:max-w-[260px] my-2  max-sm:text-[15px] text-xs ${
                  chatMessage.role === "user"
                    ? "bg-blue-500 text-white  "
                    : "bg-gray-200 text-black "
                }`}
              >
                {chatMessage.content}
                <div ref={chatEndRef} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center h-30  py-2.5 ">
          <form
            onSubmit={handleSubmit}
            className="border-2 flex justify-between 
         border-[#020e42]
          mb-2
           bg-white
             fixed
             bottom-4
             max-sm:bottom-14
             max-sm:w-[80%]
             w-[60%]
             px-4 py-2
             rounded-2xl 
             focus-within:border-2
            focus-within:border-[#a8c7fa]
              shadow-[0_0_8px_rgba(0, 0, 0, 0.6)]
               flex gap-2.5
            "
            style={{
              transformOrigin: "50% 50% 0px",
            }}
          >
            <input
              type="text"
              placeholder="Ask Bobo  Anything!"
              className="outline-0 w-full max-sm:text-[16px]"
              required
              value={inputText}
              onChange={saveInputText}
            />
            <button
              type="submit"
              className="p-2 bg-[#a8c7fa]
                      text-white 
                      rounded-full 
                      cursor-pointer
                      flex 
                      justify-center
                        items-center
                        max-sm:text-[10px]"
            >
              <Send />
            </button>
          </form>
        </div>
        <button
          onClick={clearChat}
          className="
          h-6
          w-6
          lg:h-8 
          lg:w-8
          fixed 
          bottom-4
          max-sm:bottom-8
          mt-7
          right-0 
          max-sm:ml-10
          mx-5
         bg-red-700
           text-white
            rounded-[50%] 
           text-sm
            hover:bg-[#a8c7fa] 
            cursor-pointer"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
