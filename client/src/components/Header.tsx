import { useTelegram } from "@/lib/telegram";
import { useState } from "react";
import { formatDoge } from "@/lib/game";
import { useLocation } from "wouter";

const Header = () => {
  const { user } = useTelegram();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [, setLocation] = useLocation();

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const pageTitle = () => {
    const [location] = useLocation();
    switch (location) {
      case "/":
        return "DogeCrash";
      case "/history":
        return "History";
      case "/wallet":
        return "Wallet";
      case "/settings":
        return "Settings";
      default:
        return "DogeCrash";
    }
  };

  return (
    <header className="bg-darkGray p-4 sticky top-0 z-30 border-b border-mediumGray">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="rounded-full"
          >
            <circle cx="50" cy="50" r="50" fill="#F2A900"/>
            <path d="M40.58,39.95h10.5v4.55h-5.76v6.2h5.12v4.25h-5.12v6.6h5.96v4.5H40.58V39.95z M56.18,55.9c0-6.5,3.5-10.35,8.75-10.35 c5.25,0,8.7,3.85,8.7,10.35c0,6.5-3.45,10.6-8.7,10.6C59.68,66.5,56.18,62.4,56.18,55.9z M68.08,55.95c0-4-1.15-5.75-3.15-5.75 c-2,0-3.15,1.75-3.15,5.75c0,4,1.15,5.9,3.15,5.9C66.93,61.85,68.08,59.95,68.08,55.95z M27.48,48.8c1.05-1.55,2.5-2.2,4.1-2.2 c3.45,0,5.65,2.5,5.65,7.55c0,6.1-2.9,9.65-7.65,9.65c-5.65,0-9.6-4.15-9.6-11.95c0-8.75,4.15-14,10.9-14c3.65,0,6.55,1.8,8.25,4.55 c0.7,1.1,1.1,2.4,1.35,3.95l-5.35,1.15c-0.45-3.1-1.75-4.7-4.25-4.7c-3.1,0-4.9,3.25-4.9,8.7c0,0.25,0,0.6,0.05,1.1L27.48,48.8z M31.67,58.8c1.8,0,2.85-1.75,2.85-4.6c0-2.15-0.9-2.95-2.15-2.95c-0.9,0-1.6,0.5-2.2,1.45l-1.35-3.9c0,0.45,0.05,0.9,0.05,1.4 c0,0.15,0,0.35,0,0.5v1.45c0,4.55,0.95,6.7,2.8,6.7V58.8z" fill="white"/>
          </svg>
          <h1 className="font-poppins font-bold text-xl text-dogeGold">
            {pageTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-mediumGray px-3 py-1.5 rounded-full flex items-center">
            <i className="ri-coin-line text-dogeGold mr-1"></i>
            <span className="font-medium">
              {user ? formatDoge(user.balance || 0) : '0 DOGE'}
            </span>
          </div>
          <button 
            className="bg-telegramBlue rounded-full w-8 h-8 flex items-center justify-center"
            onClick={toggleUserMenu}
          >
            <i className="ri-user-line"></i>
          </button>
        </div>
      </div>

      {/* User menu dropdown */}
      {showUserMenu && (
        <div className="absolute right-4 mt-2 bg-darkGray border border-mediumGray rounded-lg shadow-lg z-40">
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="font-medium">{user?.username || 'Anonymous'}</p>
            </div>
            <div className="border-t border-mediumGray pt-2">
              <button 
                className="py-2 px-4 w-full text-left hover:bg-mediumGray rounded"
                onClick={() => {
                  setLocation('/wallet');
                  setShowUserMenu(false);
                }}
              >
                <i className="ri-wallet-3-line mr-2"></i>
                Wallet
              </button>
              <button 
                className="py-2 px-4 w-full text-left hover:bg-mediumGray rounded"
                onClick={() => {
                  setLocation('/settings');
                  setShowUserMenu(false);
                }}
              >
                <i className="ri-settings-4-line mr-2"></i>
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
