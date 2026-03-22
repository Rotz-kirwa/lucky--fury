import { useEffect, useState, useRef } from "react";
import { Plane } from "lucide-react";

type GameState = "waiting" | "running" | "crashed";

const CrashGraph = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<GameState>("running");
  const [countdown, setCountdown] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTime = useRef(Date.now());
  const crashPoint = useRef(3.38 + Math.random() * 5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Background rays
      ctx.save();
      ctx.globalAlpha = 0.03;
      const cx = w * 0.5;
      const cy = h * 0.5;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * w, cy + Math.sin(angle) * h);
        ctx.lineTo(cx + Math.cos(angle + 0.15) * w, cy + Math.sin(angle + 0.15) * h);
        ctx.closePath();
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      ctx.restore();

      // Grid dots
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      const spacing = 60;
      for (let x = spacing; x < w; x += spacing) {
        ctx.fillRect(x, h - 10, 4, 4);
      }
      for (let y = spacing; y < h; y += spacing) {
        ctx.fillRect(4, h - y, 2, 2);
      }

      if (gameState === "waiting") return;

      const elapsed = (Date.now() - startTime.current) / 1000;
      const currentMultiplier = Math.min(1 + elapsed * 0.4, crashPoint.current);

      if (currentMultiplier >= crashPoint.current && gameState === "running") {
        setGameState("crashed");
        setMultiplier(crashPoint.current);
        setTimeout(() => {
          setGameState("waiting");
          setCountdown(5);
          const interval = setInterval(() => {
            setCountdown((c) => {
              if (c <= 1) {
                clearInterval(interval);
                startTime.current = Date.now();
                crashPoint.current = 1.2 + Math.random() * 15;
                setGameState("running");
                setMultiplier(1.0);
                return 0;
              }
              return c - 1;
            });
          }, 1000);
        }, 2000);
        return;
      }

      if (gameState === "running") {
        setMultiplier(Math.round(currentMultiplier * 100) / 100);
      }

      // Draw curve
      const points: [number, number][] = [];
      const margin = 40;
      const graphW = w - margin * 2;
      const graphH = h - margin * 2;
      const maxM = Math.max(currentMultiplier, 2);

      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const m = 1 + t * (currentMultiplier - 1);
        const px = margin + t * graphW;
        const py = h - margin - ((m - 1) / (maxM - 1)) * graphH * 0.85;
        points.push([px, py]);
      }

      // Filled area
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, "rgba(220, 38, 38, 0.05)");
      grad.addColorStop(0.5, "rgba(220, 38, 38, 0.2)");
      grad.addColorStop(1, "rgba(236, 72, 153, 0.3)");

      ctx.beginPath();
      ctx.moveTo(margin, h - margin);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(points[points.length - 1][0], h - margin);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.strokeStyle = gameState === "crashed" ? "#ef4444" : "#f43f5e";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Plane icon at tip
      if (points.length > 0) {
        const [tipX, tipY] = points[points.length - 1];
        const prevIdx = Math.max(0, points.length - 10);
        const [prevX, prevY] = points[prevIdx];
        const angle = Math.atan2(tipY - prevY, tipX - prevX);
        
        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.rotate(angle);
        
        const color = gameState === "crashed" ? "#ef4444" : "#dc2626";
        const s = 1.4;
        
        // Fuselage
        ctx.beginPath();
        ctx.moveTo(18 * s, 0);
        ctx.lineTo(-10 * s, -3 * s);
        ctx.lineTo(-14 * s, 0);
        ctx.lineTo(-10 * s, 3 * s);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Top wing
        ctx.beginPath();
        ctx.moveTo(4 * s, -2 * s);
        ctx.lineTo(-6 * s, -12 * s);
        ctx.lineTo(-10 * s, -12 * s);
        ctx.lineTo(-4 * s, -2 * s);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Bottom wing
        ctx.beginPath();
        ctx.moveTo(4 * s, 2 * s);
        ctx.lineTo(-6 * s, 12 * s);
        ctx.lineTo(-10 * s, 12 * s);
        ctx.lineTo(-4 * s, 2 * s);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Tail fin
        ctx.beginPath();
        ctx.moveTo(-10 * s, -1 * s);
        ctx.lineTo(-16 * s, -7 * s);
        ctx.lineTo(-18 * s, -7 * s);
        ctx.lineTo(-14 * s, -1 * s);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-10 * s, 1 * s);
        ctx.lineTo(-16 * s, 7 * s);
        ctx.lineTo(-18 * s, 7 * s);
        ctx.lineTo(-14 * s, 1 * s);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.restore();
      }

      if (gameState === "running") {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    if (gameState === "running") {
      animRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [gameState]);

  return (
    <div
      className="relative w-full rounded-xl border border-border/50 overflow-hidden animate-float-up"
      style={{ animationDelay: "0.3s", minHeight: "360px" }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Multiplier overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {gameState === "running" && (
          <div className="animate-multiplier-pulse">
            <span className="font-mono text-6xl sm:text-7xl md:text-8xl font-black text-foreground drop-shadow-2xl tabular-nums">
              {multiplier.toFixed(2)}x
            </span>
          </div>
        )}
        {gameState === "crashed" && (
          <div className="text-center">
            <span className="font-mono text-6xl sm:text-7xl md:text-8xl font-black text-primary drop-shadow-2xl tabular-nums">
              {multiplier.toFixed(2)}x
            </span>
            <p className="text-primary font-bold text-lg mt-2 uppercase tracking-widest">Crashed!</p>
          </div>
        )}
        {gameState === "waiting" && (
          <div className="text-center">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mb-2">Next round in</p>
            <span className="font-mono text-6xl font-black text-neon-yellow tabular-nums">{countdown}s</span>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="absolute top-3 left-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
          gameState === "running"
            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
            : gameState === "crashed"
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            gameState === "running" ? "bg-neon-green pulse-glow" : gameState === "crashed" ? "bg-primary" : "bg-neon-yellow pulse-glow"
          }`} />
          {gameState === "running" ? "Round in progress" : gameState === "crashed" ? "Crashed" : "Starting soon"}
        </div>
      </div>
    </div>
  );
};

export default CrashGraph;
