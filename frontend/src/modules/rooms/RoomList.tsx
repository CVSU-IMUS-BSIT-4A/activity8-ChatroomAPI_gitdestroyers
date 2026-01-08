import React, { useState, useEffect } from 'react';
import apiClient from '../../api/api-client';
import type { Room, ApiResponse } from '../../api/types';
import { Plus, Hash, Loader2, Trash2, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RoomListProps {
  selectedRoomId?: string;
  onSelectRoom: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ selectedRoomId, onSelectRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any, ApiResponse<Room[]>>('/rooms');
      setRooms(response.data);
      
      const hashId = window.location.hash.replace('#', '');
      if (hashId) {
        const hashRoom = response.data.find((r: Room) => r.id === hashId);
        if (hashRoom) onSelectRoom(hashRoom);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await apiClient.post<any, ApiResponse<Room>>('/rooms', { name: newRoomName });
      setRooms([response.data, ...rooms]);
      setNewRoomName('');
      setIsCreating(false);
      onSelectRoom(response.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRoom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this room?')) return;

    try {
      await apiClient.delete(`/rooms/${id}`);
      setRooms(rooms.filter(r => r.id !== id));
      if (selectedRoomId === id) {
        window.location.hash = '';
        // @ts-ignore
        onSelectRoom(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-800" />
      </div>
    );
  }

  return (
    <div className="px-4 py-2 space-y-6">
      <div>
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-600 tracking-[0.3em] font-sans">All Channels</h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-xl active:scale-90"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateRoom} className="mb-4 mx-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <input
              autoFocus
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-800 font-medium text-slate-900 dark:text-white"
              style={{ '--tw-ring-color': 'var(--primary-color)' } as any}
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl transition-all shadow-lg duration-700"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Launch
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                X
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1.5">
          {rooms.length === 0 ? (
            <div className="mx-2 p-8 border-2 border-dashed border-slate-300 dark:border-slate-900 rounded-3xl text-center">
              <p className="text-[10px] text-slate-600 dark:text-slate-700 font-black uppercase tracking-widest leading-relaxed">No frequencies found.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  "group flex items-center justify-between px-5 py-4 rounded-[20px] cursor-pointer transition-all duration-700 border",
                  selectedRoomId === room.id 
                    ? "bg-[var(--primary-color)] border-transparent text-white shadow-2xl scale-[1.02]" 
                    : "bg-transparent border-transparent text-slate-700 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-300"
                )}
                style={{ 
                  backgroundColor: selectedRoomId === room.id ? 'var(--primary-color)' : '',
                  boxShadow: selectedRoomId === room.id ? '0 10px 25px -5px var(--primary-color)' : ''
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Hash className={cn("w-4 h-4 flex-shrink-0 transition-colors duration-700", selectedRoomId === room.id ? "text-white/50" : "text-slate-500 dark:text-slate-800")} />
                  <span className="truncate text-[13px] font-bold tracking-tight">{room.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedRoomId === room.id ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <button
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-slate-600 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {error && (
        <div className="mx-2 p-4 bg-red-100 dark:bg-red-950/20 border border-red-300 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-[0.2em] text-center leading-relaxed">
          SIGNAL LOST: {error}
        </div>
      )}
    </div>
  );
};
