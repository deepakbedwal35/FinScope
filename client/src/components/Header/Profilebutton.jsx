import React, { useState, useRef } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import LogoutButton from "./LogoutButton";
import { useNavigate } from 'react-router-dom';

export default function Profilebutton() {
  const [isOpen, setIsOpen] = useState(false);
  const timeOutRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (timeOutRef.current) clearTimeout(timeOutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeOutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // Snappy 150ms delay before closing
  };

  // 🟢 Fixed: Clean navigation handler to click directly to profile
  const handleProfileClick = (e) => {
    e.stopPropagation(); // Prevents layout engine conflicts
    navigate("/profile");
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block text-white"
    >
      <Menu as="div" open={isOpen} onClose={() => setIsOpen(false)} className="relative inline-block text-white">
        
        {/* 🟢 MenuButton now handles the layout focus area cleanly without child Link conflicts */}
        <MenuButton 
          onClick={handleProfileClick}
          className="border-0 cursor-pointer inline-flex items-center justify-center gap-x-1.5 text-gray-100 rounded-lg hover:bg-neutral-700/60 p-2 transition-colors duration-200 outline-none"
        >
          
        </MenuButton>

        {/* 🟢 Modern Headless UI v2 Transition Classes */}
        <MenuItems
          static={isOpen}
          className="absolute right-0 z-50 mt-2 w-36 origin-top-right divide-y divide-white/10 rounded-md bg-neutral-800 border border-neutral-700/40 shadow-xl transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="py-1">
            <MenuItem>
              {({ focus }) => (
                <div className={`${focus ? 'bg-white/5' : ''} rounded-sm transition-colors duration-150`}>
                  <LogoutButton />
                </div>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
