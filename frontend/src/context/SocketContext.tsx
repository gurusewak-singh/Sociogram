// frontend/src/context/SocketContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { addFriend } from '../store/authSlice';
import toast from 'react-hot-toast';
import type { Author } from '../types';
import { FaTimes } from 'react-icons/fa';
import { addNotification } from '../store/notificationSlice';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
}

interface FriendRequestPayload {
  _id: string;
  username: string;
  profilePic?: string;
  message: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

const handleAcceptRequestFromToast = async (userId: string) => {
    console.log(`Accepted friend request from ${userId}`);
    // Example: await api.post(`/users/friends/accept/${userId}`);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { user: currentUser, isAuthenticated } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isAuthenticated && currentUser?._id) {
            const newSocket = io("http://localhost:5000", {
                query: { userId: currentUser._id },
                transports: ['websocket'],
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log(`[Socket Context] ✅ Socket connected! ID: ${newSocket.id}`);
            });

            newSocket.onAny((event, ...args) => {
                console.log(`[Socket Context] Received event: '${event}' with payload:`, args);
            });

            newSocket.on('new-notification', (payload: any) => {
                dispatch(addNotification({
                    _id: new Date().getTime().toString(),
                    message: payload.message,
                    read: false,
                    createdAt: new Date().toISOString(),
                }));
                toast(payload.message);
            });

            newSocket.on('friendship-accepted', (payload: { newFriend: Author }) => {
                console.log("Friendship accepted event received!", payload);
                toast.success(`You are now friends with ${payload.newFriend.username}!`);
                dispatch(addFriend(payload.newFriend));
            });

            newSocket.on('friend-request-received', (payload: FriendRequestPayload) => {
                console.log("[Socket Context] Specifically caught 'friend-request-received'. Triggering toast.");
                toast((t) => (
                  <div className="flex items-start gap-4 p-1">
                    <img 
                      src={payload.profilePic || `https://ui-avatars.com/api/?name=${payload.username}`}
                      alt={payload.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{payload.username}</p>
                      <p className="text-sm text-neutral-600">Sent you a friend request.</p>
                      <div className="mt-2 flex gap-2">
                        <button 
                          onClick={() => {
                            handleAcceptRequestFromToast(payload._id);
                            toast.dismiss(t.id);
                          }}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => toast.dismiss(t.id)}
                          className="px-3 py-1 text-sm bg-neutral-200 rounded-md hover:bg-neutral-300"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="p-1 text-neutral-400 hover:text-neutral-600">
                        <FaTimes size={12}/>
                    </button>
                  </div>
                ), { 
                    duration: 10000,
                    style: {
                        maxWidth: '400px',
                    },
                });
                dispatch(addNotification({
                  _id: payload._id,
                  message: payload.message,
                  read: false,
                  link: `/profile/${payload._id}`,
                  createdAt: new Date().toISOString(),
                }));
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [isAuthenticated, currentUser?._id, dispatch]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};