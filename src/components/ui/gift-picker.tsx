"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

const MOCK_GIFTS = [
  { id: 1, name: "Rose", coins: 10, icon: "🌹" },
  { id: 2, name: "Coffee", coins: 25, icon: "☕" },
  { id: 3, name: "Chocolate", coins: 50, icon: "🍫" },
  { id: 4, name: "Heart", coins: 100, icon: "❤️" },
  { id: 5, name: "Teddy", coins: 250, icon: "🧸" },
  { id: 6, name: "Diamond", coins: 1000, icon: "💎" },
  { id: 7, name: "Sports Car", coins: 5000, icon: "🏎️" },
  { id: 8, name: "Castle", coins: 10000, icon: "🏰" },
];

interface GiftPickerProps {
  onClose: () => void;
  onSendGift: (giftId: number, coins: number) => void;
}

export function GiftPicker({ onClose, onSendGift }: GiftPickerProps) {
  return (
    <div className="absolute bottom-20 right-4 w-80 bg-white/90 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 z-40">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Send a Gift</h3>
        <button onClick={onClose} className="text-[var(--foreground)]/50 hover:text-[var(--foreground)]">✕</button>
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
        {MOCK_GIFTS.map(gift => (
          <button 
            key={gift.id}
            onClick={() => {
              onSendGift(gift.id, gift.coins);
              onClose();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-[var(--foreground)]/5 transition group"
          >
            <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">{gift.icon}</span>
            <span className="text-[10px] font-medium text-[var(--foreground)]/70">{gift.name}</span>
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">{gift.coins}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--foreground)]/10 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-[var(--foreground)]/60">Balance:</span>
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-sm font-bold">1,250</span>
        </div>
        <Button variant="link" size="sm" className="text-[var(--primary)] text-xs h-auto p-0">
          Recharge
        </Button>
      </div>
    </div>
  );
}
