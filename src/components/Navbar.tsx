import { FormEvent, useState } from "react";
import { Bell, BellOff, Menu, Settings, Volume2, VolumeX, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

type AuthMode = "login" | "register";

const Navbar = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setMobileMenuOpen(false);
  };

  const toggleSound = () => {
    setSoundEnabled((current) => {
      const next = !current;
      toast.success(next ? "Game sound enabled" : "Game sound muted");
      return next;
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((current) => {
      const next = !current;
      toast.success(next ? "Notifications enabled" : "Notifications paused");
      return next;
    });
  };

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userName =
      authMode === "register"
        ? authForm.name || authForm.phone || "Pilot"
        : authForm.email || "Player";
    toast.success(
      authMode === "register" ? "Registration submitted" : "Login submitted",
      {
        description:
          authMode === "register"
            ? `Welcome aboard, ${userName}. Your Lucky Jet demo profile is ready.`
            : `Signed in as ${userName}.`,
      },
    );

    setAuthOpen(false);
    setAuthForm({ name: "", email: "", phone: "", password: "" });
  };

  const openSettings = () => {
    setSettingsOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="relative sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border/50">
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

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggleNotifications}
            aria-pressed={notificationsEnabled}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsEnabled && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openSettings}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <Settings className="h-4 w-4" />
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openAuth("login")}
            className="hidden sm:inline-flex border-border text-foreground hover:bg-secondary h-8 text-xs"
          >
            Login
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => openAuth("register")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-semibold"
          >
            Register
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-3 right-3 top-full mt-2 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-2xl p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="border-border text-foreground" onClick={() => openAuth("login")}>
              Login
            </Button>
            <Button type="button" className="bg-primary hover:bg-primary/90" onClick={() => openAuth("register")}>
              Register
            </Button>
          </div>
          <Button type="button" variant="secondary" className="w-full" onClick={openSettings}>
            Open Settings
          </Button>
        </div>
      )}

      {/* Gradient line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>{authMode === "register" ? "Create your Lucky Jet account" : "Log in to Lucky Jet"}</DialogTitle>
            <DialogDescription>
              {authMode === "register"
                ? "Create a demo profile to save your favorite betting setup."
                : "Use the demo login form to access your profile and wallet."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={authMode === "login" ? "default" : "outline"}
              onClick={() => setAuthMode("login")}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={authMode === "register" ? "default" : "outline"}
              onClick={() => setAuthMode("register")}
            >
              Register
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Display name</Label>
                <Input
                  id="auth-name"
                  value={authForm.name}
                  onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Rotz k"
                  required
                />
              </div>
            )}

            {authMode === "register" ? (
              <div className="space-y-2">
                <Label htmlFor="auth-phone">Phone number</Label>
                <Input
                  id="auth-phone"
                  type="tel"
                  inputMode="tel"
                  value={authForm.phone}
                  onChange={(event) => setAuthForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+254 700 000 000"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="pilot@example.com"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter your password"
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {authMode === "register" ? "Create account" : "Login"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-sm border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>Quick Settings</DialogTitle>
            <DialogDescription>Manage your demo experience without leaving the table.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <button
              type="button"
              onClick={toggleSound}
              className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-foreground">Game sound</span>
              <span className="text-xs font-semibold text-muted-foreground">{soundEnabled ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              onClick={toggleNotifications}
              className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-foreground">Round alerts</span>
              <span className="text-xs font-semibold text-muted-foreground">{notificationsEnabled ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success("Demo balance refreshed to KES 5,240.00")}
              className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-foreground">Refresh demo balance</span>
              <span className="text-xs font-semibold text-neon-green">KES 5,240.00</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
