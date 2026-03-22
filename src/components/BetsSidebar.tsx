import { useState } from "react";
import { Shield } from "lucide-react";

type Bet = {
  user: string;
  avatar: string;
  avatarBg: string;
  bet: number;
  multiplier?: number;
  cashOut?: number;
};

const fakeBets: Bet[] = [
  { user: "S****e", avatar: "S", avatarBg: "bg-neon-purple/30 text-neon-purple", bet: 3000 },
  { user: "D***n", avatar: "D", avatarBg: "bg-neon-green/30 text-neon-green", bet: 2400.88, multiplier: 3.19, cashOut: 7658.81 },
  { user: "W****e", avatar: "W", avatarBg: "bg-neon-blue/30 text-neon-blue", bet: 2300 },
  { user: "F***a", avatar: "F", avatarBg: "bg-primary/30 text-primary", bet: 1700 },
  { user: "C***o", avatar: "C", avatarBg: "bg-neon-green/30 text-neon-green", bet: 1000 },
  { user: "N***o", avatar: "N", avatarBg: "bg-neon-yellow/30 text-neon-yellow", bet: 500 },
  { user: "P***l", avatar: "P", avatarBg: "bg-neon-pink/30 text-neon-pink", bet: 340.11 },
  { user: "K***s", avatar: "K", avatarBg: "bg-primary/30 text-primary", bet: 320 },
  { user: "M***a", avatar: "M", avatarBg: "bg-neon-blue/30 text-neon-blue", bet: 120 },
  { user: "G***a", avatar: "G", avatarBg: "bg-neon-green/30 text-neon-green", bet: 100 },
  { user: "M***m", avatar: "M", avatarBg: "bg-neon-purple/30 text-neon-purple", bet: 90, multiplier: 2.22, cashOut: 199.80 },
  { user: "J***e", avatar: "J", avatarBg: "bg-neon-yellow/30 text-neon-yellow", bet: 80.21 },
  { user: "K***a", avatar: "K", avatarBg: "bg-neon-pink/30 text-neon-pink", bet: 80 },
  { user: "O***u", avatar: "O", avatarBg: "bg-neon-blue/30 text-neon-blue", bet: 70 },
  { user: "R***y", avatar: "R", avatarBg: "bg-primary/30 text-primary", bet: 70 },
  { user: "S***a", avatar: "S", avatarBg: "bg-neon-green/30 text-neon-green", bet: 60 },
  { user: "N***o", avatar: "N", avatarBg: "bg-neon-yellow/30 text-neon-yellow", bet: 50 },
  { user: "S***m", avatar: "S", avatarBg: "bg-neon-purple/30 text-neon-purple", bet: 40 },
];

const tabs = ["All Bets", "My Bets", "Top"];

const BetsSidebar = () => {
  const [activeTab, setActiveTab] = useState("All Bets");

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/50 overflow-hidden animate-float-up" style={{ animationDelay: "0.2s" }}>
      {/* Tabs */}
      <div className="flex border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">All Bets</h3>
            <p className="text-[10px] text-muted-foreground">{fakeBets.length} bets</p>
          </div>
          <span className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">← Previous hand</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 pb-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        <span>User</span>
        <span className="text-right">Bet KES</span>
        <span className="text-center w-10">X</span>
        <span className="text-right">Cash out</span>
      </div>

      {/* Bets list */}
      <div className="flex-1 overflow-y-auto px-1">
        {fakeBets.map((bet, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-2 py-1.5 mx-1 rounded-md text-xs transition-colors ${
              bet.cashOut
                ? "bg-neon-green/5 border border-neon-green/20"
                : "hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${bet.avatarBg}`}>
                {bet.avatar}
              </div>
              <span className="text-foreground/80 font-medium truncate">{bet.user}</span>
            </div>
            <span className="text-foreground font-semibold tabular-nums text-right">
              {bet.bet.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-center w-10">
              {bet.multiplier && (
                <span className="text-neon-green font-bold text-[10px] bg-neon-green/10 px-1.5 py-0.5 rounded">
                  {bet.multiplier}x
                </span>
              )}
            </span>
            <span className={`text-right font-semibold tabular-nums ${bet.cashOut ? "text-neon-green" : "text-transparent"}`}>
              {bet.cashOut ? bet.cashOut.toLocaleString("en", { minimumFractionDigits: 2 }) : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Shield className="h-3 w-3 text-neon-green" />
          <span>Provably Fair</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Powered by <span className="font-bold text-foreground/70">USHINDI</span>
        </span>
      </div>
    </div>
  );
};

export default BetsSidebar;
