import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import NotificationItem from '../components/NotificationItem';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { setNotifications } from '../store/notificationSlice';
import api from '../services/api';

const NotificationsPage = () => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector(state => state.notifications);

    useEffect(() => {
        // Fetch fresh notifications when the page loads
        api.get('/notifications').then(res => {
            dispatch(setNotifications(res.data));
        });
    }, [dispatch]);

    return (
        <MainLayout>
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-2xl font-bold mb-4 dark:text-white">Notifications</h1>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <NotificationItem 
                                key={n._id} 
                                notification={n} 
                                closeDropdown={() => {}} // No dropdown to close here
                            />
                        ))
                    ) : (
                        <p className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                            You're all caught up!
                        </p>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default NotificationsPage;