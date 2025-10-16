'use client';
import React from 'react';
import { useState } from 'react';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

const BottomNav: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('home');

  const navItems: NavItem[] = [
    { id: 'home', icon: 'fas fa-home', label: '首页' },
    { id: 'favorites', icon: 'far fa-heart', label: '收藏' },
    { id: 'profile', icon: 'far fa-user', label: '我的' },
  ];

  return (
    <div className='bottom-nav'>
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
          onClick={() => setActiveNav(item.id)}
        >
          <i className={item.icon}></i>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;
