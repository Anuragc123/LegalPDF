"use client";
import { DrizzleChat } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { MessageCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import SubscriptionButton from "./SubscriptionButton";
import { Button } from "./ui/button";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900 flex flex-col overflow-hidden">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4">New Chat</PlusCircle>
        </Button>
      </Link>

      <div className="flex-1 gap-2 pb-20 mt-4 overflow-y-auto overflow-x-hidden">
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
        <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
        </div>
        <div className="w-full flex justify-center mt-2">
          {/* Ensure SubscriptionButton fits within the sidebar width */}
          <SubscriptionButton isPro={isPro} />
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
