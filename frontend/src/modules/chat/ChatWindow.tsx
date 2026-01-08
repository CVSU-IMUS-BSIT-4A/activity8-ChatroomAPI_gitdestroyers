import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/api-client';
import { socketService } from '../../realtime/socket-service';
import type { Room, Message, ApiResponse } from '../../api/types';
import { Send, Loader2, Hash, Share2, Check, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  room: Room;
  user: { name: string; avatar: string };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ room, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Encode avatar into sender name for the backend
  const fullSenderName = `${user.name}|${user.avatar}`;

  const parseSender = (name: string) => {
    const parts = name.split('|');
    if (parts.length < 2) return { name: name, avatar: '👤' };
    const avatar = parts.pop();
    const displayName = parts.join('|');
    return { name: displayName, avatar: avatar };
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 300);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<any, ApiResponse<Message[]>>(`/rooms/${room.id}/messages`);
        setMessages(response.data);
        setTimeout(() => scrollToBottom('auto'), 100);
      } catch (err: any) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = socketService.connect();
    socketService.joinRoom(room.id);
    
    // Deep link: update hash when room changes
    window.location.hash = room.id;

    socketService.onNewMessage((message: Message) => {
      if (message.roomId === room.id) {
        setMessages((prev) => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    return () => {
      socketService.offNewMessage();
    };
  }, [room.id]);

  useEffect(() => {
    if (!showScrollBtn) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const messageContent = content;
    setContent('');

    try {
      await apiClient.post(`/rooms/${room.id}/messages`, {
        senderName: fullSenderName,
        content: messageContent,
      });
    } catch (err: any) {
      alert('Failed to send message: ' + err.message);
      setContent(messageContent);
    }
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${room.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-1000">
      {/* Background Glow */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 dark:opacity-10 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: 'var(--primary-color)', transform: 'translate(30%, -30%)' }}
      ></div>
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 transition-colors duration-1000">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-inner">
            <Hash className="w-5 h-5 transition-colors duration-700" style={{ color: 'var(--primary-color)' }} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg tracking-tight">{room.name}</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-color)' }}></span>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Live Session</p>
            </div>
          </div>
        </div>

        <button 
          onClick={copyRoomLink}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
            copied 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 dark:text-emerald-400' 
              : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700 shadow-xl active:scale-95'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Invite'}
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-500 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-color)' }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Syncing Stream</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-600 text-center space-y-4">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center mb-2 shadow-2xl transition-all duration-700">
              <Hash className="w-10 h-10 text-slate-400 dark:text-slate-800" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter italic">First Contact...</p>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-600 tracking-widest uppercase mt-2">No transmissions yet in #{room.name}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, idx) => {
              const { name, avatar } = parseSender(message.senderName);
              const isMe = name === user.name;
              const prevMsg = messages[idx - 1];
              const prevSender = prevMsg ? parseSender(prevMsg.senderName).name : null;
              const isGrouped = prevSender === name;

              return (
                <div 
                  key={message.id} 
                  className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''} ${isGrouped ? 'mt-[-20px]' : ''}`}
                >
                  {/* Avatar */}
                  {!isGrouped && (
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xl mt-1 select-none">
                      {avatar}
                    </div>
                  )}
                  {isGrouped && <div className="w-11 flex-shrink-0" />}

                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isGrouped && (
                      <div className={`flex items-center gap-2 mb-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span 
                          className="text-[10px] font-black uppercase tracking-widest transition-colors duration-700"
                          style={{ color: isMe ? 'var(--primary-color)' : '#64748b' }}
                        >
                          {isMe ? 'You' : name}
                        </span>
                        <span className="text-[9px] text-slate-600 dark:text-slate-700 font-bold uppercase">
                          {format(new Date(message.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    )}
                    <div 
                      className={`px-5 py-3.5 rounded-3xl text-[13px] font-medium shadow-2xl leading-relaxed border transition-all duration-700 ${
                        isMe 
                          ? 'text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}
                      style={{ 
                        backgroundColor: isMe ? 'var(--primary-color)' : '',
                        borderColor: isMe ? 'var(--primary-color)' : '',
                        boxShadow: isMe ? '0 10px 25px -5px var(--primary-glow)' : ''
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom */}
      {showScrollBtn && (
        <button 
          onClick={() => scrollToBottom()}
          className="absolute bottom-32 right-8 p-4 text-white rounded-2xl shadow-2xl hover:brightness-110 transition-all active:scale-90 z-30 animate-bounce shadow-indigo-500/20 border border-white/10"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input */}
      <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Message #${room.name}...`}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl px-6 py-5 text-sm focus:outline-none focus:ring-2 transition-all text-slate-900 dark:text-slate-200 pr-20 shadow-inner placeholder:text-slate-500 dark:placeholder:text-slate-700 font-medium"
              style={{ '--tw-ring-color': 'var(--primary-color)' } as any}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
               <span className="text-[9px] font-black text-slate-600 dark:text-slate-700 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors tracking-tighter">ENTER</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className="text-white p-5 rounded-3xl transition-all shadow-xl disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed active:scale-95 flex items-center justify-center group"
            style={{ 
              backgroundColor: 'var(--primary-color)',
              boxShadow: '0 10px 25px -5px var(--primary-color)'
            }}
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
