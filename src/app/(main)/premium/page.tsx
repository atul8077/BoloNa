"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Crown, Sparkles, Info } from "lucide-react";
import toast from "react-hot-toast";

const UPI_ID = "somethingerror@airtel";
const MERCHANT_NAME = "BoloNa Premium";

const TIERS = [
  { id: '1_month', name: "1 Month", price: 299, popular: false, save: "0" },
  { id: '3_months', name: "3 Months", price: 699, popular: true, save: "30%" },
  { id: '12_months', name: "12 Months", price: 1999, popular: false, save: "50%" },
];

export default function PremiumPage() {
  const [selectedTier, setSelectedTier] = React.useState<string | null>(TIERS[1].id);
  const [showPayment, setShowPayment] = React.useState(false);

  const activeTier = TIERS.find(t => t.id === selectedTier);

  const getUpiUrl = (amount: number) => {
    return `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR`;
  };

  const getQrUrl = (amount: number) => {
    const data = encodeURIComponent(getUpiUrl(amount));
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in pb-20">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-10 md:p-16 text-center shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">BoloNa Premium</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Unlock the ultimate experience. Get unlimited matches, see who liked you, and connect faster than ever.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start px-4">
        
        {/* Features List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-amber-500" /> Premium Benefits
          </h2>
          
          <ul className="space-y-4">
            {[
              "See who liked your profile instantly.",
              "Unlimited Swipes & Discoveries.",
              "Ad-free experience across the app.",
              "5 Free Super Gifts every week.",
              "Priority placement in 'Top Recommendations'.",
              "Advanced read receipts in chat."
            ].map((feature, i) => (
              <li key={i} className="flex items-start bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-[var(--foreground)]/5 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-500 mr-4 shrink-0" />
                <span className="font-medium text-[var(--foreground)]/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Subscription Tiers & Payment */}
        <div className="space-y-6">
          {!showPayment ? (
            <div className="bg-white/50 dark:bg-[#0F172A]/50 p-6 rounded-3xl border border-[var(--foreground)]/10 shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6">Choose your plan</h3>
              
              <div className="space-y-4">
                {TIERS.map((tier) => (
                  <div 
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedTier === tier.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-lg' : 'border-[var(--foreground)]/10 hover:border-amber-500/50'}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        Most Popular
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-bold">{tier.name}</h4>
                        {tier.save !== "0" && <p className="text-sm text-green-600 font-bold mt-1">Save {tier.save}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-[var(--primary)]">₹{tier.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setShowPayment(true)}
                className="w-full mt-8 h-14 rounded-full text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/30 border-none"
              >
                Continue to Payment
              </Button>
            </div>
          ) : (
            
            <div className="bg-white/50 dark:bg-[#0F172A]/50 p-6 rounded-3xl border border-[var(--foreground)]/10 shadow-xl backdrop-blur-xl animate-in slide-in-from-right-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Pay via UPI</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPayment(false)} className="text-[var(--foreground)]/50">Change Plan</Button>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex justify-between items-center mb-8 border border-amber-200 dark:border-amber-900/50">
                <span className="font-medium text-amber-900 dark:text-amber-500">{activeTier?.name} Plan</span>
                <span className="text-xl font-bold text-amber-900 dark:text-amber-500">₹{activeTier?.price}</span>
              </div>
              
              <div className="flex flex-col items-center space-y-6">
                
                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                  <img src={getQrUrl(activeTier?.price || 0)} alt="UPI QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm font-semibold text-center">Scan with any UPI App<br/><span className="text-xs text-[var(--foreground)]/50 font-normal">{UPI_ID}</span></p>

                <div className="w-full h-px bg-[var(--foreground)]/10" />

                {/* Direct UPI Apps */}
                <div className="w-full space-y-3">
                  <p className="text-center font-medium text-[var(--foreground)]/80 mb-2">Or pay directly using</p>
                  
                  <a href={getUpiUrl(activeTier?.price || 0)} className="block w-full">
                    <Button className="w-full h-12 text-lg font-bold bg-[#6739B7] hover:bg-[#5E35B1] text-white rounded-xl">PhonePe</Button>
                  </a>
                  
                  <a href={getUpiUrl(activeTier?.price || 0)} className="block w-full">
                    <Button className="w-full h-12 text-lg font-bold bg-[#00BAF2] hover:bg-[#00A8DB] text-white rounded-xl">Paytm</Button>
                  </a>

                  <a href={getUpiUrl(activeTier?.price || 0)} className="block w-full">
                    <Button className="w-full h-12 text-lg font-bold bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 rounded-xl">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" className="w-5 h-5 mr-2 inline" />
                      Google Pay
                    </Button>
                  </a>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-[var(--foreground)]/50">
                  <Info className="w-4 h-4" />
                  <span>Secure UPI Payment by {MERCHANT_NAME}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
