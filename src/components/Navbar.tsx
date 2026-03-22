import { Bell, Menu, Volume2, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14 w-full">
        {/* Logo */}
        <div className="flex items-center gap-1 select-none">
          <span className="text-xl font-black tracking-tight text-foreground">LUCKY</span>
          <span className="text-xl font-black tracking-tight text-primary">JET</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Balance */}
          <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 mr-1">
            <Wallet className="h-4 w-4 text-neon-green" />
            <span className="text-sm font-semibold text-foreground">KES 5,240.00</span>
          </div>

          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Volume2 className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground hidden sm:flex">
            <Settings className="h-4 w-4" />
          </button>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex border-border text-foreground hover:bg-secondary h-8 text-xs">
            Login
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-semibold">
            Register
          </Button>
        </div>
      </div>
      {/* Gradient line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </nav>
  );
};

export default Navbar;
