import React, { useState, useEffect } from 'react';
import { RoomList } from './modules/rooms/RoomList';
import { ChatWindow } from './modules/chat/ChatWindow';
import type { Room } from './api/types';
import { MessageSquare, Sparkles, Share2, LogOut, Sun, Moon, Heart } from 'lucide-react';

const EMOJI_THEMES: Record<string, string> = {
  '🦄': '#f472b6', // Pink (Unicorn)
  '🚀': '#6366f1', // Indigo
  '🐱': '#fbbf24', // Amber (Cat)
  '🧙‍♂️': '#8b5cf6', // Violet
  '🤖': '#0ea5e9', // Sky
  '🦊': '#f97316', // Orange
  '🌈': '#f43f5e', // Rose
  '🔥': '#ef4444', // Red
  '💎': '#06b6d4', // Cyan
  '🎮': '#84cc16', // Lime
};

const EMOJIS = Object.keys(EMOJI_THEMES);

function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(() => {
    const saved = localStorage.getItem('chat_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(EMOJIS[0]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chat_theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  // Apply theme class to document on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('chat_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Apply theme immediately on mount (before React renders)
  useEffect(() => {
    const saved = localStorage.getItem('chat_theme');
    const shouldBeDark = saved ? saved === 'dark' : true;
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Dynamic Theme Logic
  useEffect(() => {
    const avatar = user?.avatar || tempAvatar;
    const color = EMOJI_THEMES[avatar] || '#6366f1';
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--primary-glow', `${color}40`);
  }, [user?.avatar, tempAvatar]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    
    const newUser = { name: tempName.trim(), avatar: tempAvatar };
    setUser(newUser);
    localStorage.setItem('chat_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chat_user');
  };

  const primaryColor = user?.avatar ? EMOJI_THEMES[user.avatar] : EMOJI_THEMES[tempAvatar] || '#6366f1';

  if (!user) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 font-sans transition-all duration-1000 relative overflow-hidden bg-slate-50 dark:bg-slate-950"
      >
        {/* Animated Background Gradient */}
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${primaryColor}40 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, ${primaryColor}30 0%, transparent 50%),
                        radial-gradient(circle at 40% 20%, ${primaryColor}20 0%, transparent 50%)`,
            animation: 'gradient-shift 8s ease infinite',
            backgroundSize: '200% 200%',
          }}
        />

        <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative z-10 transition-all duration-700">
          <div className="absolute top-6 right-6">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 active:scale-95"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-10">
            <div 
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-float relative group"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 20px 40px -10px ${primaryColor}60`
              }}
            >
              <MessageSquare className="w-12 h-12 text-white z-10" />
              <div 
                className="absolute inset-0 rounded-[2rem] animate-pulse-glow opacity-50"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Chat Persona</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Choose your vibe and jump in ✨</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-8">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-3 ml-2 tracking-[0.25em]">Your Display Name</label>
              <input
                autoFocus
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="e.g. Space Cowboy"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                style={{ '--tw-ring-color': `${primaryColor}40` } as any}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-4 ml-2 tracking-[0.25em]">Pick an Avatar</label>
              <div className="grid grid-cols-5 gap-4">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setTempAvatar(emoji)}
                    className={`text-3xl p-4 rounded-2xl transition-all duration-500 relative group ${
                      tempAvatar === emoji 
                        ? 'bg-white dark:bg-slate-800 shadow-xl scale-110' 
                        : 'hover:bg-white dark:hover:bg-slate-800 opacity-50 hover:opacity-100'
                    }`}
                    style={{ 
                      borderColor: tempAvatar === emoji ? primaryColor : 'transparent',
                      borderWidth: '2px'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!tempName.trim()}
              className="w-full text-white font-black py-5 rounded-2xl transition-all duration-700 shadow-2xl active:scale-[0.97] flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 15px 35px -10px ${primaryColor}80`
              }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Chatting</span>
              <Heart className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-all duration-1000 relative">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-5 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 20%, ${primaryColor}50 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, ${primaryColor}40 0%, transparent 40%)`,
        }}
      />

      {/* Sidebar - Room List */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-900 flex flex-col flex-shrink-0 bg-white/80 dark:bg-slate-900/50 backdrop-blur-3xl relative z-10">
        <div className="p-6 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-2xl shadow-xl transition-all duration-700 relative group"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageSquare className="w-5 h-5 text-white relative z-10" />
              <div className="absolute inset-0 rounded-2xl animate-pulse-glow opacity-50" style={{ backgroundColor: primaryColor }} />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase gradient-text">ChatRooms</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 active:scale-95"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="p-5 mx-4 my-6 bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 group relative overflow-hidden shadow-lg transition-all duration-500">
          <div className="flex items-center gap-4 relative z-10">
            <div className="text-4xl bg-slate-50 dark:bg-slate-950 w-14 h-14 flex items-center justify-center rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 animate-float">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Your Persona</p>
              <p className="font-black truncate text-lg transition-all duration-700" style={{ color: primaryColor }}>{user.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all hover:scale-110"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <RoomList 
            selectedRoomId={selectedRoom?.id} 
            onSelectRoom={setSelectedRoom} 
          />
        </div>
      </div>

      {/* Main Content - Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {selectedRoom ? (
          <ChatWindow 
            room={selectedRoom} 
            user={user} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 dark:text-slate-500 p-8 text-center max-w-lg mx-auto">
            <div className="w-28 h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-float">
              <Sparkles className="w-12 h-12 transition-colors duration-700" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mb-4 tracking-tight gradient-text">Ready to dive in?</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-10 text-sm">
              Select a room from the sidebar to join the conversation, or create your own space to invite others.
            </p>
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 shadow-lg">
                <Share2 className="w-6 h-6 mb-3 text-emerald-500 dark:text-emerald-400 mx-auto" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1">Invite Only</p>
                <p className="text-[10px] text-slate-500 mt-1">Copy links to bring friends in</p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-105 shadow-lg">
                <Sparkles className="w-6 h-6 mb-3 text-amber-500 dark:text-amber-400 mx-auto" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1">Disposable</p>
                <p className="text-[10px] text-slate-500 mt-1">Persona stays until you leave</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
