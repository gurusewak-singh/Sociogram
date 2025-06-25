//frontend/src/pages/AccountPage.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const AccountPage = () => {
  const navLinkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-200'
        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
    }`;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* --- LEFT NAVIGATION FOR ACCOUNT SETTINGS --- */}
        <nav className="flex-shrink-0 md:w-56 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md h-fit">
            <h2 className="text-lg font-bold mb-4 dark:text-white px-2">Account Settings</h2>
            <ul className="space-y-1">
                <li><NavLink to="/account/edit" className={navLinkClasses}>Edit Profile</NavLink></li>
                <li><NavLink to="/account/liked" className={navLinkClasses}>Liked Posts</NavLink></li>
                {/* Add more links here later, like "Change Password" */}
            </ul>
        </nav>

        {/* --- MAIN CONTENT AREA FOR THE SELECTED TAB --- */}
        <main className="flex-1 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <Outlet /> {/* This is where the nested route components will render */}
        </main>
      </div>
    </MainLayout>
  );
};

export default AccountPage;