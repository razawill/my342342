import { useLocation, Link } from "wouter";

const Navigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-darkGray border-t border-mediumGray sticky bottom-0 z-30">
      <div className="grid grid-cols-4 gap-1">
        <Link href="/">
          <div className={`py-3 flex flex-col items-center justify-center cursor-pointer ${isActive('/') ? 'text-telegramBlue' : 'text-gray-500'}`}>
            <i className="ri-game-line text-xl"></i>
            <span className="text-xs mt-1">Game</span>
          </div>
        </Link>
        <Link href="/history">
          <div className={`py-3 flex flex-col items-center justify-center cursor-pointer ${isActive('/history') ? 'text-telegramBlue' : 'text-gray-500'}`}>
            <i className="ri-history-line text-xl"></i>
            <span className="text-xs mt-1">History</span>
          </div>
        </Link>
        <Link href="/wallet">
          <div className={`py-3 flex flex-col items-center justify-center cursor-pointer ${isActive('/wallet') ? 'text-telegramBlue' : 'text-gray-500'}`}>
            <i className="ri-wallet-3-line text-xl"></i>
            <span className="text-xs mt-1">Wallet</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className={`py-3 flex flex-col items-center justify-center cursor-pointer ${isActive('/settings') ? 'text-telegramBlue' : 'text-gray-500'}`}>
            <i className="ri-settings-4-line text-xl"></i>
            <span className="text-xs mt-1">Settings</span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
