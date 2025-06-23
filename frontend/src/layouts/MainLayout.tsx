// frontend/src/layouts/MainLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom'; 
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';
import type { Author } from '../types';
import { FaBell } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks'; // Import hooks
import NotificationItem from '../components/NotificationItem'; // <-- Import
import { setNotifications, markInformationalAsRead } from '../store/notificationSlice'; // Import actions
import TimeAgo from '../components/TimeAgo';

// A placeholder for the sidebar component we will build later
const LeftSidebar = () => {
  // We'll use NavLink for active styling
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 p-3 rounded-lg transition-colors text-base font-medium ${
      isActive
        // --- REFINED ACTIVE STYLES ---
        ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-200'
        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300'
    }`;

  // We should get the current user's ID for the profile link
  const { user } = useAppSelector(state => state.auth);

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-neutral-800 p-4 border-r border-neutral-200 dark:border-neutral-700 hidden md:block">
      <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 px-3">
        Sociogram
      </Link>
      
      <nav className="mt-8 flex flex-col gap-2">
        {/* Converted to NavLink for active state styling */}
        <NavLink to="/" className={navLinkClasses} end>Home</NavLink>
        <NavLink to="/explore" className={navLinkClasses}>Explore</NavLink>
        <NavLink to="/notifications" className={navLinkClasses}>Notifications</NavLink>
        <NavLink to="/messages" className={navLinkClasses}>Messages</NavLink>
        {user && <NavLink to={`/profile/${user._id}`} className={navLinkClasses}>Profile</NavLink>}
        <NavLink to="/settings" className={navLinkClasses}>Settings</NavLink>
      </nav>

      {/* You can add user profile info at the bottom of the sidebar later */}
    </aside>
  );
};

// --- UPDATE THE RIGHT PANEL ---
const RightPanel = () => {
    const [friends, setFriends] = useState<Author[]>([]);
    
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get('/friend/friends');
                setFriends(res.data);
            } catch (error) {
                console.error("Could not fetch friends", error);
            }
        };
        fetchFriends();
    }, []);

    return (
        <aside className="w-80 flex-shrink-0 bg-white dark:bg-neutral-800 p-4 border-l border-neutral-200 dark:border-neutral-700 hidden lg:block">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Chats</h3>
            <div className="flex flex-col gap-2">
                {friends.length > 0 ? friends.map(friend => (
                    <Link to={`/messages/${friend._id}`} key={friend._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100">
                         <img
                            src={friend.profilePic || `https://ui-avatars.com/api/?name=${friend.username}`}
                            alt={friend.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium text-neutral-700">{friend.username}</span>
                    </Link>
                )) : (
                    <p className="text-sm text-neutral-500">Add friends to start chatting.</p>
                )}
            </div>
        </aside>
    );
}

// --- REFACTORED TOPBAR COMPONENT ---
const Topbar = () => {
    // --- GET NOTIFICATION DATA FROM REDUX ---
    const { notifications, unreadCount } = useAppSelector(state => state.notifications);
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector(state => state.auth); // <-- Get user from Redux
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Author[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Effect for handling clicks outside the notification dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Empty dependency array ensures this runs only once

    // Effect for search logic
    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true);
            api.get(`/users/search?q=${debouncedSearchTerm}`)
                .then(res => {
                    setResults(res.data);
                })
                .catch(err => console.error(err))
                .finally(() => setIsSearching(false));
        } else {
            setResults([]);
        }
    }, [debouncedSearchTerm]);

    // --- CLICK HANDLER FOR THE BELL ICON ---
    const handleBellClick = async () => {
        const isOpening = !showNotifications;
        setShowNotifications(isOpening);

        if (isOpening) {
            setIsLoadingNotifs(true);
            try {
                const res = await api.get('/notifications');
                dispatch(setNotifications(res.data)); // Populate the store
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setIsLoadingNotifs(false);
            }
        } else {
            // When closing, mark only like/comment as read
            if (unreadCount > 0) {
                api.put('/notifications/read-all'); // Fire and forget
                dispatch(markInformationalAsRead());
            }
        }
    };
    
    return (
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 sticky top-0 z-20">
            <div className="flex items-center justify-between">
                 {/* --- SEARCH BAR CONTAINER --- */}
                <div className="flex-1 max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search for users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-transparent focus:bg-white dark:focus:bg-neutral-600 text-neutral-800 dark:text-neutral-200 focus:border-primary-500 focus:outline-none"
                    />
                    {/* --- SEARCH RESULTS DROPDOWN --- */}
                    {searchTerm && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg overflow-hidden">
                            {isSearching && <div className="p-4 text-sm text-neutral-500">Searching...</div>}
                            {!isSearching && results.length === 0 && debouncedSearchTerm && (
                                <div className="p-4 text-sm text-neutral-500">No users found.</div>
                            )}
                            {results.map(user => (
                                <Link
                                    to={`/profile/${user._id}`}
                                    key={user._id}
                                    onClick={() => setSearchTerm('')}
                                    className="flex items-center gap-3 p-3 hover:bg-neutral-100"
                                >
                                    <img
                                        src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}`}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span>{user.username}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                {/* --- NOTIFICATION & USER MENU --- */}
                <div className="flex items-center gap-4">
                    <div className="relative" ref={notificationRef}>
                        <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-neutral-100 relative">
                            <FaBell size={20} />
                            {/* --- UNREAD COUNT BADGE --- */}
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200">
                                <div className="p-3 font-bold border-b">Notifications</div>
                                <div className="flex flex-col max-h-96 overflow-y-auto">
                                    {isLoadingNotifs ? (
                                        <div className="p-4 text-center text-sm text-neutral-500">Loading...</div>
                                    ) : notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <NotificationItem 
                                                key={n._id} 
                                                notification={n} 
                                                closeDropdown={() => setShowNotifications(false)}
                                            />
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-neutral-500">You're all caught up!</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* --- USER MENU --- */}
                    {currentUser ? (
                        <Link to={`/profile/${currentUser._id}`}>
                            <img
                                src={currentUser.profilePic || `https://ui-avatars.com/api/?name=${currentUser.username}`}
                                alt="Your profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </Link>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    )}
                </div>
            </div>
        </header>
    );
}

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-neutral-50 font-sans">
      <LeftSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-900"> {/* Added theme classes here */}
            {/* The main content for each page will be rendered here */}
            {children}
        </div>
      </main>
      <RightPanel />
    </div>
  );
};

export default MainLayout;