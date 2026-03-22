import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import JackpotTicker from "@/components/JackpotTicker";
import BetsSidebar from "@/components/BetsSidebar";
import CrashGraph from "@/components/CrashGraph";
import BetPanel from "@/components/BetPanel";
import FooterNote from "@/components/FooterNote";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <JackpotTicker />

      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 max-w-[1440px] mx-auto w-full">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center justify-between bg-card rounded-xl border border-border/50 px-4 py-3 text-sm font-semibold text-foreground"
        >
          <span>Live Bets (18)</span>
          {sidebarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Left sidebar */}
        <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="h-[calc(100vh-180px)] lg:sticky lg:top-[120px]">
            <BetsSidebar />
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <CrashGraph />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BetPanel panelId={0} />
            <BetPanel panelId={1} />
          </div>
        </div>
      </div>

      <FooterNote />
    </div>
  );
};

export default Index;
