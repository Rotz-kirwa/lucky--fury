import Navbar from "@/components/Navbar";
import JackpotTicker from "@/components/JackpotTicker";
import BetsSidebar from "@/components/BetsSidebar";
import CrashGraph from "@/components/CrashGraph";
import BetPanel from "@/components/BetPanel";
import FooterNote from "@/components/FooterNote";

const Index = () => (
    <div className="min-h-screen bg-background flex flex-col lg:h-screen lg:overflow-hidden">
      <Navbar />
      <JackpotTicker />

      <div className="flex-1 flex flex-col gap-3 px-3 pb-3 pt-2 w-full lg:min-h-0">
        <div className="flex flex-1 flex-col lg:flex-row gap-3 min-h-0">
          {/* Live bets */}
          <div className="order-2 lg:order-1 w-full lg:w-[25rem] xl:w-[27rem] flex-shrink-0 lg:min-h-0">
            <div className="h-[24rem] sm:h-[26rem] lg:h-full">
              <BetsSidebar />
            </div>
          </div>

          {/* Main area */}
          <div className="order-1 lg:order-2 flex-1 flex flex-col gap-3 min-w-0 lg:min-h-0">
            <CrashGraph />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BetPanel panelId={0} />
              <BetPanel panelId={1} />
            </div>
          </div>
        </div>
      </div>

      <FooterNote />
    </div>
);

export default Index;
