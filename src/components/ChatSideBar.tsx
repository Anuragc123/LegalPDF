"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen p-4 soff text-gray-200 bg-gray-900 flex flex-col">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4">New Chat</PlusCircle>
        </Button>
      </Link>

      <div className="flex-1 gap-2 pb-20 mt-4 overflow-y-auto">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
        </div>
        <Button
          className="mt-2 text-white bg-slate-700 "
          disabled={loading}
          onClick={handleSubscription}
        >
          Upgrade to Pro!
        </Button>
      </div>
    </div>
  );
};

export default ChatSideBar;
