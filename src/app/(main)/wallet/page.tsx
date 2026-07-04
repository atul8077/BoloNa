"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, History, Info, QrCode } from "lucide-react";

const UPI_ID = "somethingerror@airtel";
const MERCHANT_NAME = "BoloNa";

const mockPackages = [
  { id: 1, coins: 100, price: 99, bonus: 0 },
  { id: 2, coins: 500, price: 449, bonus: 50 },
  { id: 3, coins: 1000, price: 899, bonus: 150 },
  { id: 4, coins: 5000, price: 4299, bonus: 1000, popular: true },
];

export default function WalletPage() {
  const [selectedPackage, setSelectedPackage] = React.useState<number | null>(null);

  const getUpiUrl = (amount: number) => {
    return `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR`;
  };

  const getQrUrl = (amount: number) => {
    const data = encodeURIComponent(getUpiUrl(amount));
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data}`;
  };

  const selectedPkg = mockPackages.find(p => p.id === selectedPackage);

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white border-none shadow-2xl overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
        <CardContent className="p-8 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Available Balance</p>
            <div className="flex items-center space-x-3">
              <img src="/icons/coin.svg" alt="Coin" className="w-10 h-10 drop-shadow-md" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <h2 className="text-5xl font-extrabold tracking-tight">1,250</h2>
            </div>
          </div>
          <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md">
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mt-8 mb-4">Recharge Coins</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockPackages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`cursor-pointer transition-all duration-300 border-2 ${selectedPackage === pkg.id ? 'border-[var(--primary)] shadow-lg scale-105 bg-[var(--primary)]/5' : 'border-transparent hover:border-[var(--primary)]/50 bg-white/50 dark:bg-white/5'}`}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            <div className="relative p-4 flex flex-col items-center text-center h-full justify-center">
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-[var(--primary)] mb-1">{pkg.coins}</h3>
              <p className="text-sm text-[var(--foreground)]/60 font-medium mb-3">Coins</p>
              
              {pkg.bonus > 0 && (
                <p className="text-xs text-green-500 font-bold mb-3 bg-green-500/10 px-2 py-1 rounded-full">
                  +{pkg.bonus} Bonus
                </p>
              )}
              
              <div className="mt-auto pt-4 border-t border-[var(--foreground)]/10 w-full">
                <span className="font-bold text-lg">₹{pkg.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Section - UPI Focus */}
      {selectedPkg && (
        <Card className="mt-8 border-none bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-xl shadow-xl animate-in slide-in-from-bottom-4">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Complete Payment</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
              
              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                  <img src={getQrUrl(selectedPkg.price)} alt="UPI QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Scan with any UPI App</p>
                  <p className="text-xs text-[var(--foreground)]/60">{UPI_ID}</p>
                </div>
              </div>

              <div className="hidden md:block w-px h-48 bg-[var(--foreground)]/10" />

              {/* Direct UPI Apps Section */}
              <div className="flex flex-col space-y-4 w-full md:w-auto min-w-[250px]">
                <p className="text-center font-medium text-[var(--foreground)]/80 mb-2">Or pay directly using</p>
                
                <a href={getUpiUrl(selectedPkg.price)} className="w-full">
                  <Button className="w-full h-12 text-lg font-bold bg-[#6739B7] hover:bg-[#5E35B1] text-white rounded-xl">
                    PhonePe
                  </Button>
                </a>
                
                <a href={getUpiUrl(selectedPkg.price)} className="w-full">
                  <Button className="w-full h-12 text-lg font-bold bg-[#00BAF2] hover:bg-[#00A8DB] text-white rounded-xl">
                    Paytm
                  </Button>
                </a>

                <a href={getUpiUrl(selectedPkg.price)} className="w-full">
                  <Button className="w-full h-12 text-lg font-bold bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 rounded-xl">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" className="w-5 h-5 mr-2 inline" />
                    Google Pay
                  </Button>
                </a>
                
                <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-[var(--foreground)]/50">
                  <Info className="w-4 h-4" />
                  <span>Secure UPI Payment by {MERCHANT_NAME}</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
