'use client'

import React, { useEffect, useRef } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Send } from 'lucide-react'
import MessageList from './MessageList'
import { useChat } from '@ai-sdk/react'

const ChatPdf = () => {
  const { input, handleInputChange, handleSubmit, messages } = useChat()
  const messageContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="relative h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 bg-white border-b shadow-sm">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* Message List (Scroll Area) */}
      <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4">
        <MessageList />
      </div>

      <div className="sticky bottom-0 inset-x-0 bg-white border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="flex-1"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            className="bg-blue-600"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatPdf
