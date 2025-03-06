'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { HTTP_BACKEND } from '@/config';
import { Send } from 'lucide-react';

type Message = {
    role: string;
    content: string;
};

const ChatPdf = ({ documentId }: { documentId: string }) => {
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const [messgaes, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');

    const { getToken } = useAuth();

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
        }
    }, [messgaes]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const token = await getToken();
            const allMessages = await axios.get(
                `${HTTP_BACKEND}/user/documents/${documentId}/chat`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Inside useEffect');

            setMessages(allMessages.data.chats);
            setLoading(false);
        })();
    }, [documentId, getToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        const token = await getToken();

        try {
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'user', content: input },
            ]);
            const response = await axios.post(
                `${HTTP_BACKEND}/user/documents/${documentId}/chat`,
                { message: input },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: response.data.response },
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    return (
        <div className="relative h-screen flex flex-col bg-white">
            <div className="p-3 bg-gray-50 border-b shadow-sm">
                <h3 className="text-2xl font-bold">Chat</h3>
            </div>
            <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4"
            >
                {messgaes.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded-lg w-fit max-w-xs my-2 ${msg.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200'}`}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="sticky bottom-0 inset-x-0 bg-white border-t p-3">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask any question..."
                        className="flex-1"
                        aria-label="Chat input"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        className="bg-blue-600"
                        disabled={!input.trim() || loading}
                    >
                        {loading ? '...' : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatPdf;
