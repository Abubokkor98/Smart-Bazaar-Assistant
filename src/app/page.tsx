/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  ShoppingBasket,
  Loader2,
  Tag,
  Sparkles,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append, error, reload } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const value = input;
    setInput("");
    await append({ role: "user", content: value });
  };

  const handleSuggestionClick = async (text: string) => {
    setInput("");
    await append({ role: "user", content: text });
  };

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto flex max-w-2xl items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-900/20">
            <ShoppingBasket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">
              Bajar Bondhu
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium text-emerald-400">
                Online & Ready
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative container mx-auto max-w-2xl">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-4 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700"
        >
          <div className="flex flex-col gap-6 pb-24">
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="my-auto flex flex-col items-center justify-center gap-8 py-12 text-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-2xl">
                    <Sparkles className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2 max-w-md">
                  <h2 className="text-2xl font-bold text-white">
                    How can I help you shop?
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    Compare prices, plan meals, or get market updates.
                  </p>
                </div>

                <div className="grid w-full gap-2 sm:grid-cols-2">
                  {[
                    "Price of 1kg Beef?",
                    "Cost for Polao (5 people)?",
                    "Latest onion prices?",
                    "Vegetable market update",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:bg-zinc-800 hover:text-white text-left"
                    >
                      {suggestion}
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-emerald-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m) => {
              // The separate loading indicator will show status instead
              const hasParts = m.parts && m.parts.length > 0;
              const hasContent =
              
                (m as any).content &&
                String((m as any).content).trim().length > 0;

              if (!hasParts && !hasContent) return null;

              return (
                <div
                  key={m.id}
                  className={`flex gap-4 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 border border-zinc-800 shadow-sm shrink-0">
                    {m.role === "user" ? (
                      <AvatarFallback className="bg-emerald-600 text-white font-medium">
                        ME
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage
                          src="/bot-avatar.png"
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-zinc-800 text-emerald-500 font-bold">
                          BB
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  {/* Bubble */}
                  <div
                    className={`flex flex-col gap-2 max-w-[85%] ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`relative rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-md ${
                        m.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-sm"
                          : "bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-tl-sm"
                      }`}
                    >
                      {m.parts &&
                        m.parts.map((part, idx) => {
                          // Text
                          if (part.type === "text") {
                            return (
                              <p key={idx} className="whitespace-pre-wrap">
                                {part.content}
                              </p>
                            );
                          }

                          // Tool Call
                          if (part.type === "tool-call") {
                            const toolPart = part as unknown as {
                              args: { item_name?: string };
                            };
                            return (
                              <div
                                key={idx}
                                className="my-2 flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-700/50 p-2.5 text-xs text-zinc-400"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10">
                                  <Tag className="h-3 w-3 text-emerald-500" />
                                </div>
                                <span>
                                  Checking price for{" "}
                                  <span className="font-semibold text-emerald-400">
                                    {toolPart.args?.item_name || "item"}
                                  </span>
                                  ...
                                </span>
                              </div>
                            );
                          }

                          // Thinking
                          if (part.type === "thinking") {
                            return (
                              <span
                                key={idx}
                                className="block text-xs text-zinc-500 italic mb-1"
                              >
                                Thinking...
                              </span>
                            );
                          }

                          // Debug unknown type
                          return (
                            <p key={idx} className="text-xs text-red-400">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              Unknown type: {(part as any).type}
                            </p>
                          );
                        })}

                      {/* Fallback for missing parts */}
                      {(!m.parts || m.parts.length === 0) && (
                        <p className="whitespace-pre-wrap">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(m as any).content}
                        </p>
                      )}
                    </div>

                    {/* Timestamp/Status (Optional) */}
                    <span className="text-[10px] text-zinc-500 opacity-50 px-1">
                      {m.role === "user" ? "Sent" : "Bajar Bondhu"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-center gap-3 p-4">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 max-w-sm text-center">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Something went wrong</span>
                  </div>
                  {/* Only show technical details on hover or if critical, keeping it clean for now */}
                  <p className="text-xs opacity-80">
                    {error.message || "Unable to generate response"}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reload()}
                    className="mt-1 h-7 border-red-500/30 hover:bg-red-500/20 hover:text-red-300 text-xs gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate response
                  </Button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="h-9 w-9 border border-zinc-800 shadow-sm shrink-0">
                  <AvatarFallback className="bg-zinc-800 text-emerald-500 font-bold">
                    BB
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-zinc-950 p-4 border-t border-zinc-800">
        <div className="container mx-auto max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about daily bazar prices..."
              className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 pl-4 py-6 rounded-xl text-base shadow-inner"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 h-10 w-10 text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </form>
          <p className="mt-3 text-center text-[10px] text-zinc-600">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </main>
  );
}
