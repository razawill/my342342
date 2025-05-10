import { useState } from "react";
import { useTelegram } from "@/lib/telegram";
import { useDeposit, useWithdraw, useTransactionHistory, MIN_DEPOSIT, MIN_WITHDRAW } from "@/lib/wallet";
import { formatDoge } from "@/lib/game";
import { useToast } from "@/hooks/use-toast";

const WalletPage = () => {
  const { user } = useTelegram();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("20");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactionHistory();
  
  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amount < MIN_DEPOSIT) {
      toast({
        title: "Deposit too small",
        description: `Minimum deposit is ${MIN_DEPOSIT} DOGE`,
        variant: "destructive",
      });
      return;
    }
    
    deposit.mutate(amount, {
      onSuccess: () => {
        toast({
          title: "Deposit successful",
          description: `${amount} DOGE has been added to your balance`,
          variant: "default",
        });
        setDepositAmount("100");
      },
      onError: (error) => {
        toast({
          title: "Deposit failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amount < MIN_WITHDRAW) {
      toast({
        title: "Withdrawal too small",
        description: `Minimum withdrawal is ${MIN_WITHDRAW} DOGE`,
        variant: "destructive",
      });
      return;
    }
    
    if (!withdrawAddress) {
      toast({
        title: "Missing address",
        description: "Please enter a DOGE address",
        variant: "destructive",
      });
      return;
    }
    
    if (user?.balance && amount > user.balance) {
      toast({
        title: "Insufficient balance",
        description: "Withdrawal amount exceeds your balance",
        variant: "destructive",
      });
      return;
    }
    
    withdraw.mutate({ amount, address: withdrawAddress }, {
      onSuccess: () => {
        toast({
          title: "Withdrawal initiated",
          description: `${amount} DOGE has been sent to your address`,
          variant: "default",
        });
        setWithdrawAmount("20");
        setWithdrawAddress("");
      },
      onError: (error) => {
        toast({
          title: "Withdrawal failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-poppins mb-2">Wallet</h1>
        <p className="text-gray-400">Manage your Dogecoin balance</p>
      </div>
      
      {/* Balance card */}
      <div className="bg-darkGray rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400">Your Balance</div>
            <div className="text-3xl font-bold text-dogeGold">
              {user ? formatDoge(user.balance || 0) : '0 DOGE'}
            </div>
          </div>
          <div className="w-12 h-12 bg-dogeGold bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="ri-wallet-3-line text-2xl text-dogeGold"></i>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-mediumGray mb-4">
        <button 
          className={`py-2 px-4 ${activeTab === 'deposit' ? 'border-b-2 border-telegramBlue font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'withdraw' ? 'border-b-2 border-telegramBlue font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-telegramBlue font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>
      
      {/* Deposit tab */}
      {activeTab === 'deposit' && (
        <div className="bg-darkGray rounded-xl p-4">
          <h2 className="font-poppins font-medium text-lg mb-4">Deposit DOGE</h2>
          
          {user?.depositAddress && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Your Deposit Address</div>
              <div className="bg-mediumGray p-3 rounded-lg text-sm break-all font-mono">
                {user.depositAddress}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Send Dogecoin to this address to deposit funds
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Amount to Deposit</div>
            <div className="relative">
              <input
                type="number"
                className="w-full bg-mediumGray text-white p-3 pr-16 rounded-lg input-focus"
                placeholder="Deposit amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dogeGold font-medium">
                DOGE
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Minimum deposit: {MIN_DEPOSIT} DOGE
            </div>
          </div>
          
          <button
            onClick={handleDeposit}
            disabled={deposit.isPending}
            className={`w-full py-3 ${deposit.isPending ? 'bg-gray-500' : 'bg-dogeGold shine'} text-dark rounded-xl font-poppins font-bold text-xl`}
          >
            {deposit.isPending ? "Processing..." : "Deposit Now"}
          </button>
          
          <div className="mt-4 p-3 bg-mediumGray rounded-lg text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <i className="ri-information-line text-telegramBlue mt-0.5"></i>
              <div>
                <p className="mb-2">For demonstration purposes, deposits are simulated instantly.</p>
                <p>In a production version, you would need to wait for blockchain confirmations.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Withdraw tab */}
      {activeTab === 'withdraw' && (
        <div className="bg-darkGray rounded-xl p-4">
          <h2 className="font-poppins font-medium text-lg mb-4">Withdraw DOGE</h2>
          
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">DOGE Address</div>
            <input
              type="text"
              className="w-full bg-mediumGray text-white p-3 rounded-lg input-focus"
              placeholder="Enter Dogecoin address"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Amount to Withdraw</div>
            <div className="relative">
              <input
                type="number"
                className="w-full bg-mediumGray text-white p-3 pr-16 rounded-lg input-focus"
                placeholder="Withdraw amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dogeGold font-medium">
                DOGE
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Minimum withdrawal: {MIN_WITHDRAW} DOGE
            </div>
          </div>
          
          <button
            onClick={handleWithdraw}
            disabled={withdraw.isPending}
            className={`w-full py-3 ${withdraw.isPending ? 'bg-gray-500' : 'bg-dogeGold shine'} text-dark rounded-xl font-poppins font-bold text-xl`}
          >
            {withdraw.isPending ? "Processing..." : "Withdraw Now"}
          </button>
          
          <div className="mt-4 p-3 bg-mediumGray rounded-lg text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <i className="ri-information-line text-telegramBlue mt-0.5"></i>
              <div>
                <p className="mb-2">For demonstration purposes, withdrawals are simulated instantly.</p>
                <p>In a production version, blockchain transactions would take time to process.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* History tab */}
      {activeTab === 'history' && (
        <div className="bg-darkGray rounded-xl p-4">
          <h2 className="font-poppins font-medium text-lg mb-4">Transaction History</h2>
          
          {isLoadingTransactions ? (
            <div className="text-center py-4">Loading transactions...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-4 text-gray-400">No transaction history</div>
          ) : (
            <div className="divide-y divide-mediumGray">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-success bg-opacity-20' : 
                          tx.type === 'withdrawal' ? 'bg-crash bg-opacity-20' :
                          tx.type === 'bet' ? 'bg-mediumGray' :
                          'bg-telegramBlue bg-opacity-20'
                        }`}
                      >
                        {tx.type === 'deposit' && <i className="ri-arrow-down-line text-success"></i>}
                        {tx.type === 'withdrawal' && <i className="ri-arrow-up-line text-crash"></i>}
                        {tx.type === 'bet' && <i className="ri-gamepad-line text-gray-400"></i>}
                        {tx.type === 'win' && <i className="ri-trophy-line text-telegramBlue"></i>}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${tx.amount > 0 ? 'text-success' : 'text-crash'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatDoge(tx.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletPage;
