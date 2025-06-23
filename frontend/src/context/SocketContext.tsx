// frontend/src/context/SocketContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import api from '../services/api';
import { setCredentials, addFriend } from '../store/authSlice';
import toast from 'react-hot-toast';
import type { Author } from '../types';
import { FaTimes } from 'react-icons/fa';
import { setNotifications, addNotification } from '../store/notificationSlice';

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

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    // Use a ref to hold the socket instance. Refs persist across re-renders without causing them.
    const socketRef = useRef<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { user: currentUser, isAuthenticated } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Only run if the user is authenticated
        if (isAuthenticated && currentUser) {
            // And only if there isn't already an active socket connection
            if (!socketRef.current) {
                console.log(`[Socket Context] Creating new socket connection for user: ${currentUser._id}`);
                
                // Create the new socket and store it in the ref
                socketRef.current = io("http://localhost:5000", {
                    query: { userId: currentUser._id },
                    transports: ['websocket'],
                });

                // --- ATTACH ALL LISTENERS ONCE ---
                socketRef.current.on('connect', () => {
                    console.log(`[Socket Context] ✅ Socket connected! ID: ${socketRef.current?.id}`);
                });

                // The 'catch-all' listener. This will log EVERY event from the server.
                socketRef.current.onAny((event, ...args) => {
                    console.log(`[Socket Context] Received event: '${event}' with payload:`, args);
                });

                // Listen to the GENERIC 'new-notification' event
                socketRef.current.on('new-notification', (payload: any) => {
                    dispatch(addNotification({
                        _id: new Date().getTime().toString(), // Use a temporary ID
                        message: payload.message, // Use 'message' to match NotificationType
                        read: false,
                        createdAt: new Date().toISOString(),
                    }));
                    toast(payload.message);
                });

                // Listen for friendship-accepted event
                socketRef.current.on('friendship-accepted', (payload: { newFriend: Author }) => {
                    console.log("Friendship accepted event received!", payload);
                    toast.success(`You are now friends with ${payload.newFriend.username}!`);
                    dispatch(addFriend(payload.newFriend));
                });

                // Specific listener for friend-request-received
                socketRef.current.on('friend-request-received', (payload: FriendRequestPayload) => {
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
                                handleAcceptRequest(payload._id);
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
                        {/* --- ADD A CLOSE BUTTON --- */}
                        <button onClick={() => toast.dismiss(t.id)} className="p-1 text-neutral-400 hover:text-neutral-600">
                            <FaTimes size={12}/>
                        </button>
                      </div>
                    ), { 
                        duration: 10000, // Stays for 10 seconds
                        // You can add custom styling here if you wish
                        style: {
                            maxWidth: '400px',
                        },
                    });
                    // Also add it to the Redux store for persistence
                    dispatch(addNotification({
                      _id: payload._id,
                      message: payload.message,
                      read: false,
                      link: `/profile/${payload._id}`,
                      createdAt: new Date().toISOString(),
                    }));
                });
            }
        }

        // The cleanup function will run when the user logs out (isAuthenticated becomes false)
        return () => {
            if (socketRef.current) {
                console.log(`[Socket Context] Disconnecting socket for user ${currentUser?._id}.`);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, currentUser, dispatch]);

    // We provide the ref's current value to the context
    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};