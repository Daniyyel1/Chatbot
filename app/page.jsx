"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="flex h-screen justify-center items-center bg-[#a8c7fa]  ">
      <button
        className="flex justify-center items-center capitalize
         lg:text-2xl 
        text-md
         cursor-pointer 
         border-[#020e42]
         bg-[#020e42]
         text-white 
        h-20
         w-90
         max-sm:w-70
         gap-2.5
         rounded-lg
         hover:bg-amber-50
         hover:text-black
         "
        onClick={() => router.push("/chat")}
      >
        Click to start Bobo Chatbot <SendHorizontal />
      </button>
    </div>
  );
}
