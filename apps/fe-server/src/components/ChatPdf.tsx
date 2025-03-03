'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Send } from 'lucide-react'
import {}  from '@ai-sdk/react'
import axios from 'axios'
import { HTTP_BACKEND } from '@/config'
import { useAuth } from '@clerk/nextjs'

type Message = {
  role: "user" | "system";
  content: string;
};

const ChatPdf = ({documentId} : {documentId: string}) => {
  
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const [chats,setChats] = useState<Message[]>([])
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const  {getToken} = useAuth()

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight
    }
    
  }, [chats])

  useEffect(()=>{
    (async()=>{
      const token = await getToken()
      const allMessages = await axios.get(`${HTTP_BACKEND}/user/documents/${documentId}/chat`,
        {
        headers: {
            Authorization: `Bearer ${token}`
          }
      })
      console.log("Inside useEffect");
      
      setChats(allMessages.data.chats)
    })()
    
  },[])


  async function handleSubmit(e: React.FormEvent){
    console.log("inside handlesubmit");
    const token = await getToken()
    
    e.preventDefault()
    if (!query.trim()) return;
    setLoading(true)

    const newMessage: Message = { role: "user", content: query };
    setChats((prevChat)=> [...prevChat, newMessage])
    console.log("inside handlesubmit chats",chats);

    setQuery('')
    try {
      const res = await axios.post(`${HTTP_BACKEND}/user/documents/${documentId}/chat`,{
        query: JSON.stringify(query)
      },{
        headers:{
            Authorization: `Bearer ${token}`
        }
      })

      const reader = res.data.body.getReader();
      const decoder = new TextDecoder();
      let systemMessage  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value,{stream:true});
        systemMessage += chunk;
        setChats((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === "system") {
            return [...prev.slice(0, -1), { role: "system", content: systemMessage }];
          } else {
            return [...prev, { role: "system", content: systemMessage }];
          }
        });
      }
      } catch (error) {
        console.log("Error:", error);
      }finally{
      setLoading(false) 
      }
    }

  return (
    <div className="relative h-screen flex flex-col bg-white">
      <div className="p-3 bg-white border-b shadow-sm">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4">
      {chats.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg w-fit max-w-xs ${
              msg.role === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 inset-x-0 bg-white border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Ask any question..."
            className="flex-1"
            aria-label="Chat input"
            disabled={loading}
          />
          <Button
            type="submit"
            className="bg-blue-600"
            disabled={!query.trim() || loading}
          >
          {loading ? "..." : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}


export default ChatPdf
