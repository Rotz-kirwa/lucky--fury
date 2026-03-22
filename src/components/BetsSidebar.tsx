import { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "@/components/ui/sonner";

type Bet = {
  id: string;
  user: string;
  avatar: string;
  avatarBg: string;
  bet: number;
  multiplier?: number;
  cashOut?: number;
};

type BetStatus = "active" | "cashed" | "lost";

type LiveBet = Bet & {
  autoCashout: number | null;
  liveMultiplier?: number;
  status: BetStatus;
};

type RoundState = "waiting" | "running" | "crashed";

type RoundStateDetail = {
  gameState: RoundState;
  multiplier: number;
};

const fakeBets: Bet[] = [
  { id: "bet-1", user: "S****e", avatar: "S", avatarBg: "bg-neon-purple/30 text-neon-purple", bet: 3000 },
  { id: "bet-2", user: "D***n", avatar: "D", avatarBg: "bg-neon-green/30 text-neon-green", bet: 2400.88 },
  { id: "bet-3", user: "W****e", avatar: "W", avatarBg: "bg-neon-blue/30 text-neon-blue", bet: 2300 },
  { id: "bet-4", user: "F***a", avatar: "F", avatarBg: "bg-primary/30 text-primary", bet: 1700 },
  { id: "bet-5", user: "C***o", avatar: "C", avatarBg: "bg-neon-green/30 text-neon-green", bet: 1000 },
  { id: "bet-6", user: "N***o", avatar: "N", avatarBg: "bg-neon-yellow/30 text-neon-yellow", bet: 500 },
  { id: "bet-7", user: "P***l", avatar: "P", avatarBg: "bg-neon-pink/30 text-neon-pink", bet: 340.11 },
  { id: "bet-8", user: "K***s", avatar: "K", avatarBg: "bg-primary/30 text-primary", bet: 320 },
  { id: "bet-9", user: "M***a", avatar: "M", avatarBg: "bg-neon-blue/30 text-neon-blue", bet: 120 },
  { id: "bet-10", user: "G***a", avatar: "G", avatarBg: "bg-neon-green/30 text-neon-green", bet: 100 },
  { id: "bet-11", user: "M***m", avatar: "M", avatarBg: "bg-neon-purple/30 text-neon-purple", bet: 90 },
  { id: "bet-12", user: "J***e", avatar: "J", avatarBg: "bg-neon-yellow/30 text-neon-yellow", bet: 80.21 },
  { id: "bet-13", user: "K***a", avatar: "K", avatarBg: "bg-neon-pink/30 text-neon-pink", bet: 80 },
  { id: "bet-14", user: "O***u", avatar: "O", avatarBg: "bg-neon-blue/30 text-neon-blue", bet: 70 },
  { id: "bet-15", user: "R***y", avatar: "R", avatarBg: "bg-primary/30 text-primary", bet: 70 },
  { id: "bet-16", user: "S***a", avatar: "S", avatarBg: "bg-neon-green/30 text-neon-green", bet: 60 },
  { id: "bet-17", user: "N***o", avatar: "N", avatarBg: "bg-neon-yellow/30 text-neon-yellow", bet: 50 },
  { id: "bet-18", user: "S***m", avatar: "S", avatarBg: "bg-neon-purple/30 text-neon-purple", bet: 40 },
];

const tabs = ["All Bets", "My Bets", "Top"];
const ROUND_STATE_EVENT = "luckyjet-round-state";
const mobileTabLabels: Record<string, string> = {
  "All Bets": "All Bets",
  "My Bets": "Previous",
  Top: "Top",
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const roundMultiplierValue = (value: number) => Math.round(value * 100) / 100;

const createCashoutTarget = (index: number) => {
  const shouldCashOut = Math.random() < (index < 6 ? 0.72 : 0.48);

  if (!shouldCashOut) {
    return null;
  }

  return roundMultiplierValue(1.15 + Math.random() * (index < 3 ? 5.4 : 3.25));
};

const createRoundBets = (): LiveBet[] =>
  fakeBets.map((bet, index) => ({
    ...bet,
    bet: roundCurrency(Math.max(10, bet.bet * (0.76 + Math.random() * 0.58))),
    autoCashout: createCashoutTarget(index),
    cashOut: undefined,
    liveMultiplier: 1,
    multiplier: undefined,
    status: "active",
  }));

const advanceRoundBets = (bets: LiveBet[], currentMultiplier: number) => {
  const safeMultiplier = roundMultiplierValue(Math.max(1, currentMultiplier));

  return bets.map((bet) => {
    if (bet.status !== "active") {
      return bet;
    }

    if (bet.autoCashout !== null && safeMultiplier >= bet.autoCashout) {
      return {
        ...bet,
        cashOut: roundCurrency(bet.bet * bet.autoCashout),
        liveMultiplier: undefined,
        multiplier: bet.autoCashout,
        status: "cashed",
      };
    }

    return {
      ...bet,
      liveMultiplier: safeMultiplier,
    };
  });
};

const settleRoundBets = (bets: LiveBet[]) =>
  bets.map((bet) =>
    bet.status === "active"
      ? {
          ...bet,
          liveMultiplier: undefined,
          multiplier: undefined,
          cashOut: undefined,
          status: "lost" as const,
        }
      : bet,
  );

const seedPreviousRound = () => settleRoundBets(advanceRoundBets(createRoundBets(), 2.6 + Math.random() * 1.6));

const BetsSidebar = () => {
  const [activeTab, setActiveTab] = useState("All Bets");
  const [currentRoundBets, setCurrentRoundBets] = useState<LiveBet[]>(() => createRoundBets());
  const [previousRoundBets, setPreviousRoundBets] = useState<LiveBet[]>(() => seedPreviousRound());
  const currentRoundBetsRef = useRef(currentRoundBets);
  const previousRoundStateRef = useRef<RoundState>("running");

  useEffect(() => {
    currentRoundBetsRef.current = currentRoundBets;
  }, [currentRoundBets]);

  useEffect(() => {
    const handleRoundState = (event: Event) => {
      const { gameState, multiplier } = (event as CustomEvent<RoundStateDetail>).detail;
      const previousGameState = previousRoundStateRef.current;

      if (gameState === "running") {
        if (previousGameState !== "running") {
          setPreviousRoundBets(settleRoundBets(currentRoundBetsRef.current));

          const nextRoundBets = advanceRoundBets(createRoundBets(), multiplier);
          currentRoundBetsRef.current = nextRoundBets;
          setCurrentRoundBets(nextRoundBets);
        } else {
          setCurrentRoundBets((current) => {
            const next = advanceRoundBets(current, multiplier);
            currentRoundBetsRef.current = next;
            return next;
          });
        }
      } else if (gameState === "crashed") {
        setCurrentRoundBets((current) => {
          const next = settleRoundBets(current);
          currentRoundBetsRef.current = next;
          return next;
        });
      }

      previousRoundStateRef.current = gameState;
    };

    window.addEventListener(ROUND_STATE_EVENT, handleRoundState as EventListener);

    return () => {
      window.removeEventListener(ROUND_STATE_EVENT, handleRoundState as EventListener);
    };
  }, []);

  const sourceBets =
    activeTab === "My Bets"
      ? previousRoundBets
      : currentRoundBets;
  const displayedBets =
    activeTab === "Top"
      ? [...currentRoundBets].sort((left, right) => (right.cashOut ?? right.bet) - (left.cashOut ?? left.bet)).slice(0, 10)
      : sourceBets;
  const winningBets = displayedBets.filter((bet) => bet.status === "cashed");
  const totalCashOut = winningBets.reduce((sum, bet) => sum + (bet.cashOut ?? 0), 0);
  const previewAvatars = displayedBets.slice(0, 3);
  const desktopTitle = activeTab === "My Bets" ? "Previous Hand" : activeTab;
  const mobileTitle = mobileTabLabels[activeTab] ?? activeTab;

  const handlePreviousHand = () => {
    setActiveTab("My Bets");
    toast.success("Showing previous hand", {
      description: "The sidebar has switched to the last completed round.",
    });
  };

  const handleProvablyFair = () => {
    toast.success("Provably fair check ready", {
      description: "Demo mode would reveal the round seed and verification hash here.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/50 overflow-hidden animate-float-up" style={{ animationDelay: "0.2s" }}>
      {/* Tabs */}
      <div className="hidden sm:flex border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
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

      <div className="sm:hidden px-3 pt-3 pb-2 border-b border-border/50 space-y-3">
        <div className="flex items-center gap-1 rounded-full bg-secondary/70 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {mobileTabLabels[tab] ?? tab}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center">
              {previewAvatars.map((bet, index) => (
                <div
                  key={`${bet.user}-${index}`}
                  className={`-ml-1 first:ml-0 h-7 w-7 rounded-full border border-card flex items-center justify-center text-[10px] font-bold ${bet.avatarBg}`}
                >
                  {bet.avatar}
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] font-medium text-foreground/85">
              {mobileTitle} <span className="text-muted-foreground">{displayedBets.length} bets</span>
            </p>
            <div className="mt-1 h-1 w-20 rounded-full bg-neon-green/20">
              <div className="h-full w-10 rounded-full bg-neon-green" />
            </div>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold tabular-nums text-foreground">
              {totalCashOut.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground">Total win KES</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="hidden sm:block px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{desktopTitle}</h3>
            <p className="text-[10px] text-muted-foreground">{displayedBets.length} bets</p>
          </div>
          <button
            type="button"
            onClick={handlePreviousHand}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Previous hand
          </button>
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
        {displayedBets.map((bet, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-2 py-1.5 mx-1 rounded-md text-xs transition-colors ${
              bet.status === "cashed"
                ? "bg-neon-green/5 border border-neon-green/20"
                : bet.status === "active"
                ? "bg-neon-blue/5 border border-neon-blue/15 hover:bg-neon-blue/10"
                : bet.status === "lost"
                ? "bg-primary/5 border border-primary/10 hover:bg-primary/10"
                : "hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${bet.avatarBg}`}>
                {bet.avatar}
              </div>
              <div className="min-w-0 flex items-center gap-1.5">
                {bet.status === "active" && <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse flex-shrink-0" />}
                <span className="text-foreground/80 font-medium truncate">{bet.user}</span>
              </div>
            </div>
            <span className="text-foreground font-semibold tabular-nums text-right">
              {bet.bet.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-center w-10">
              {bet.status === "active" && bet.liveMultiplier && (
                <span className="text-neon-yellow font-bold text-[10px] bg-neon-yellow/10 px-1.5 py-0.5 rounded animate-pulse">
                  {bet.liveMultiplier.toFixed(2)}x
                </span>
              )}
              {bet.status === "cashed" && bet.multiplier && (
                <span className="text-neon-green font-bold text-[10px] bg-neon-green/10 px-1.5 py-0.5 rounded">
                  {bet.multiplier}x
                </span>
              )}
              {bet.status === "lost" && (
                <span className="text-primary font-bold text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">
                  Bust
                </span>
              )}
            </span>
            <span
              className={`text-right font-semibold tabular-nums ${
                bet.status === "cashed"
                  ? "text-neon-green"
                  : bet.status === "active"
                  ? "text-neon-blue/80"
                  : bet.status === "lost"
                  ? "text-primary/75"
                  : "text-transparent"
              }`}
            >
              {bet.status === "cashed"
                ? bet.cashOut?.toLocaleString("en", { minimumFractionDigits: 2 })
                : bet.status === "active"
                ? "In play"
                : bet.status === "lost"
                ? "Crashed"
                : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 px-3 py-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleProvablyFair}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Shield className="h-3 w-3 text-neon-green" />
          <span>Provably Fair</span>
        </button>
        <span className="text-[10px] text-muted-foreground">
          Powered by <span className="font-bold text-foreground/70">LUCKY JET</span>
        </span>
      </div>
    </div>
  );
};

export default BetsSidebar;
