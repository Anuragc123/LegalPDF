"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatbotPopup from "./chatbot-popup";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg bg-indigo-600 hover:bg-indigo-700 z-50"
        aria-label="Open legal assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <ChatbotPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
