import { useState } from "react";
import { useTelegram } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MIN_BET, MIN_DEPOSIT, MIN_WITHDRAW } from "@/lib/wallet";

const SettingsPage = () => {
  const { user } = useTelegram();
  const { toast } = useToast();
  
  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(true);
  const [defaultAutoCashout, setDefaultAutoCashout] = useState("2.00");
  const [defaultBetAmount, setDefaultBetAmount] = useState("10.00");
  
  const handleSaveSettings = () => {
    // In a full implementation, this would save settings to the server
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  const handleResetSettings = () => {
    setSoundEnabled(true);
    setVibrationEnabled(true);
    setNotificationsEnabled(true);
    setNightModeEnabled(false);
    setAutoCashoutEnabled(true);
    setDefaultAutoCashout("2.00");
    setDefaultBetAmount("10.00");
    
    toast({
      title: "Settings reset",
      description: "Your preferences have been restored to defaults",
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-poppins mb-2">Settings</h1>
        <p className="text-gray-400">Customize your gaming experience</p>
      </div>
      
      {/* Account info */}
      <div className="bg-darkGray rounded-xl p-4 mb-6">
        <h2 className="font-poppins font-medium text-lg mb-3">Account Information</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Username</div>
            <div className="font-medium">@{user?.username || 'Anonymous'}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Telegram ID</div>
            <div className="font-medium">{user?.id || 'Unknown'}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Account Created</div>
            <div className="font-medium">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game preferences */}
      <div className="bg-darkGray rounded-xl p-4 mb-6">
        <h2 className="font-poppins font-medium text-lg mb-3">Game Preferences</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Default Bet Amount</div>
              <div className="text-sm text-gray-400">
                Set your default betting amount
              </div>
            </div>
            <div className="w-24 relative">
              <input
                type="number"
                className="w-full bg-mediumGray text-white p-2 pr-12 rounded-lg input-focus text-right"
                value={defaultBetAmount}
                onChange={(e) => setDefaultBetAmount(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dogeGold text-xs">
                DOGE
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto Cashout</div>
                <div className="text-sm text-gray-400">
                  Automatically cash out at multiplier
                </div>
              </div>
              <Switch
                checked={autoCashoutEnabled}
                onCheckedChange={setAutoCashoutEnabled}
              />
            </div>
            
            {autoCashoutEnabled && (
              <div className="flex items-center justify-between ml-4">
                <div className="text-sm text-gray-400">
                  Default multiplier
                </div>
                <div className="w-20 relative">
                  <input
                    type="number"
                    className="w-full bg-mediumGray text-white p-2 pr-6 rounded-lg input-focus text-right"
                    value={defaultAutoCashout}
                    onChange={(e) => setDefaultAutoCashout(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-telegramBlue text-xs">
                    ×
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-4 bg-mediumGray" />
        
        <div className="space-y-4">
          <h3 className="font-medium">Game Limits</h3>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Minimum Bet</div>
            <div className="font-medium text-dogeGold">{MIN_BET} DOGE</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Minimum Deposit</div>
            <div className="font-medium text-dogeGold">{MIN_DEPOSIT} DOGE</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Minimum Withdrawal</div>
            <div className="font-medium text-dogeGold">{MIN_WITHDRAW} DOGE</div>
          </div>
        </div>
      </div>
      
      {/* App settings */}
      <div className="bg-darkGray rounded-xl p-4 mb-6">
        <h2 className="font-poppins font-medium text-lg mb-3">App Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sound Effects</div>
              <div className="text-sm text-gray-400">
                Enable game sounds
              </div>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Vibration</div>
              <div className="text-sm text-gray-400">
                Enable haptic feedback
              </div>
            </div>
            <Switch
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-400">
                Receive alerts about games
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Night Mode</div>
              <div className="text-sm text-gray-400">
                Use dark color scheme
              </div>
            </div>
            <Switch
              checked={nightModeEnabled}
              onCheckedChange={setNightModeEnabled}
            />
          </div>
        </div>
      </div>
      
      {/* App info */}
      <div className="bg-darkGray rounded-xl p-4 mb-6">
        <h2 className="font-poppins font-medium text-lg mb-3">About</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Version</div>
            <div className="font-medium">1.0.0</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Developed by</div>
            <div className="font-medium">DogeCrash Team</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Support</div>
            <a href="https://t.me/dogecrash_support" className="text-telegramBlue">
              @dogecrash_support
            </a>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleResetSettings}
          className="flex-1 py-3 bg-mediumGray text-white rounded-xl font-poppins font-bold"
        >
          Reset to Default
        </button>
        
        <button
          onClick={handleSaveSettings}
          className="flex-1 py-3 bg-dogeGold text-dark rounded-xl font-poppins font-bold shine"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
