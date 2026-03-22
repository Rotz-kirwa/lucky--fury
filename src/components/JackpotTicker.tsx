import { RefreshCw } from "lucide-react";

const multipliers = [
  { value: "1.58x", color: "text-neon-blue" },
  { value: "1.85x", color: "text-neon-pink" },
  { value: "1.50x", color: "text-neon-blue" },
  { value: "2.37x", color: "text-neon-purple" },
  { value: "1.15x", color: "text-neon-blue" },
  { value: "1.40x", color: "text-neon-blue" },
  { value: "2.89x", color: "text-neon-purple" },
  { value: "1.51x", color: "text-neon-blue" },
  { value: "5.62x", color: "text-neon-yellow" },
  { value: "4.33x", color: "text-neon-yellow" },
  { value: "15.90x", color: "text-neon-green" },
  { value: "2.21x", color: "text-neon-purple" },
  { value: "1.36x", color: "text-neon-blue" },
  { value: "4.94x", color: "text-neon-yellow" },
  { value: "11.00x", color: "text-neon-green" },
  { value: "3.17x", color: "text-neon-purple" },
  { value: "1.24x", color: "text-neon-blue" },
  { value: "1.13x", color: "text-neon-blue" },
  { value: "1.89x", color: "text-neon-pink" },
  { value: "8.06x", color: "text-neon-yellow" },
  { value: "2.06x", color: "text-neon-purple" },
  { value: "12.05x", color: "text-neon-green" },
  { value: "25.05x", color: "text-neon-green" },
  { value: "38.91x", color: "text-neon-green" },
  { value: "40.14x", color: "text-neon-green" },
  { value: "1.08x", color: "text-neon-blue" },
  { value: "1.81x", color: "text-neon-pink" },
  { value: "2.79x", color: "text-neon-purple" },
];

const JackpotTicker = () => {
  return (
    <div className="w-full animate-float-up" style={{ animationDelay: "0.1s" }}>
      {/* Jackpot banner */}
      <div className="bg-gradient-to-r from-neon-green/20 via-neon-green/10 to-neon-green/20 border-b border-neon-green/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-neon-green font-bold text-sm">KES 25,000</span>
          <span className="text-foreground/80 text-sm font-medium">Ushindi Crash Jackpot</span>
        </div>
        <button className="p-1.5 rounded-full hover:bg-secondary transition-colors text-neon-green">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Multiplier ticker */}
      <div className="bg-card/60 border-b border-border/30 overflow-hidden h-8 flex items-center">
        <div className="ticker-scroll flex gap-3 whitespace-nowrap px-4">
          {[...multipliers, ...multipliers].map((m, i) => (
            <span key={i} className={`text-xs font-bold ${m.color} flex-shrink-0`}>
              {m.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JackpotTicker;
