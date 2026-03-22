import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const quickAmounts = [100, 500, 1000, 3000];

interface BetPanelProps {
  panelId: number;
}

const BetPanel = ({ panelId }: BetPanelProps) => {
  const [amount, setAmount] = useState(10);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");
  const [statusMessage, setStatusMessage] = useState("Ready to place a bet");

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(1, prev + delta));
    setStatusMessage("Stake updated");
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setStatusMessage("Stake updated");
  };

  const handleTabChange = (tab: "bet" | "auto") => {
    setActiveTab(tab);
    setStatusMessage(tab === "bet" ? "Ready to place a bet" : "Auto bet mode armed");
  };

  const handlePrimaryAction = () => {
    const formattedAmount = `${amount.toFixed(2)} KES`;
    const panelName = `Panel ${panelId + 1}`;

    if (activeTab === "bet") {
      setStatusMessage(`Bet queued for ${formattedAmount}`);
      toast.success(`Bet queued: ${formattedAmount}`, {
        description: `${panelName} is ready for the next round.`,
      });
      return;
    }

    setStatusMessage(`Auto bet armed for ${formattedAmount}`);
    toast.success(`Auto bet armed: ${formattedAmount}`, {
      description: `${panelName} will reuse this stake automatically.`,
    });
  };

  const actionLabel = activeTab === "bet" ? "BET" : "AUTO BET";

  return (
    <div
      className="bg-card rounded-xl border border-border/50 p-4 animate-float-up"
      style={{ animationDelay: `${0.4 + panelId * 0.1}s` }}
    >
      {/* Tabs */}
      <div className="flex bg-secondary rounded-lg p-0.5 mb-4">
        {(["bet", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            aria-pressed={activeTab === tab}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Amount control */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => adjustAmount(-10)}
          aria-label="Decrease amount"
          className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 bg-secondary rounded-lg h-10 flex items-center justify-center">
          <span className="font-bold text-lg text-foreground tabular-nums">{amount}</span>
        </div>
        <button
          type="button"
          onClick={() => adjustAmount(10)}
          aria-label="Increase amount"
          className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {quickAmounts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleAmountSelect(q)}
            className={`py-1.5 rounded-md text-xs font-semibold transition-all active:scale-95 ${
              amount === q
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {q.toLocaleString()}
          </button>
        ))}
      </div>

      {/* BET button */}
      <button
        type="button"
        onClick={handlePrimaryAction}
        className="w-full py-3.5 rounded-xl bg-neon-green text-accent-foreground font-black text-sm uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.97] glow-green"
      >
        <div className="text-[10px] font-semibold opacity-70">{actionLabel}</div>
        <div className="text-base tabular-nums">{amount.toFixed(2)} KES</div>
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/70">{statusMessage}</p>
    </div>
  );
};

export default BetPanel;
