import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dock from './ui/Dock';
import ProfileModal from './ProfileModal';
import { LayoutDashboard, ClipboardList, BarChart2, User, Shield } from 'lucide-react';

export default function Layout() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  
  const role = localStorage.getItem('swachhlens_role');

  const dockItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard', 
      onClick: () => navigate('/') 
    },
    { 
      icon: <ClipboardList size={20} />, 
      label: 'Complaints', 
      onClick: () => navigate('/complaints') 
    },
    { 
      icon: <BarChart2 size={20} />, 
      label: 'Analytics', 
      onClick: () => navigate('/analytics') 
    },
    { 
      icon: <User size={20} />, 
      label: 'Profile', 
      onClick: () => setIsProfileOpen(true) 
    },
  ];

  if (role === 'commissioner') {
    dockItems.splice(3, 0, {
      icon: <Shield size={20} />,
      label: 'Admin',
      onClick: () => navigate('/admin')
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex selection:bg-teal-500/30">
      {/* Global Background Elements */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
      
      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all">
        <Navbar
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto pb-32">
          <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
      </div>

      {/* macOS-style Floating Dock Navigation */}
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
