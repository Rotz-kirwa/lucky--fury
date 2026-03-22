import { useEffect, useRef, useState } from "react";

type GameState = "waiting" | "running" | "crashed";

type PlotRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

const CRASH_BURST_DURATION = 0.35;
const NEXT_ROUND_DELAY = 1800;
const LOG_SCALE_MIN_MULTIPLIER = 1;
const MIN_FLIGHT_PLOT_WIDTH = 120;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SMALL_Y_AXIS_LEVELS = [1, 2, 5, 10, 20, 50, 100];
const FULL_Y_AXIS_LEVELS = [1, 2, 3, 5, 10, 20, 50, 100];

const CrashGraph = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<GameState>("running");
  const [countdown, setCountdown] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTime = useRef(Date.now());
  const crashPoint = useRef(3.38 + Math.random() * 5);
  const crashStartedAtRef = useRef<number | null>(null);
  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current);
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clearRoundTimers = () => {
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current);
        nextRoundTimeoutRef.current = null;
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };

    const getFlightDuration = (crashValue: number) => clamp(1.8 + crashValue * 0.28, 2.2, 5.8);

    const getPlotRect = (width: number, height: number): PlotRect => {
      const compact = width < 640;
      const left = compact ? 44 : 58;
      const right = compact ? 14 : 18;
      const top = compact ? 32 : 38;
      const bottom = height - (compact ? 26 : 34);

      return {
        left,
        right: width - right,
        top,
        bottom,
        width: width - left - right,
        height: bottom - top,
      };
    };

    const getFlightPlotRect = (plot: PlotRect, width: number): PlotRect => {
      // Keep the visible flight path inside the chart so the plane body,
      // not just its anchor point, stays fully visible near the crash point.
      const rightFlightPadding = clamp(width * 0.12, 84, 108);
      const right = Math.max(plot.left + MIN_FLIGHT_PLOT_WIDTH, plot.right - rightFlightPadding);

      return {
        ...plot,
        right,
        width: right - plot.left,
      };
    };

    const getAxisMaxMultiplier = (crashValue: number, width: number) => {
      const levels = width < 640 ? SMALL_Y_AXIS_LEVELS : FULL_Y_AXIS_LEVELS;
      const target = Math.max(5, crashValue * 1.18);
      return levels.find((level) => level >= target) ?? levels[levels.length - 1];
    };

    const getYAxisLevels = (axisMax: number, width: number) => {
      const levels = width < 640 ? SMALL_Y_AXIS_LEVELS : FULL_Y_AXIS_LEVELS;
      const visibleLevels = levels.filter((level) => level <= axisMax);
      return visibleLevels[visibleLevels.length - 1] === axisMax ? visibleLevels : [...visibleLevels, axisMax];
    };

    const getLogScaleRatio = (value: number, axisMax: number) => {
      const safeValue = clamp(value, LOG_SCALE_MIN_MULTIPLIER, axisMax);
      const minLog = Math.log10(LOG_SCALE_MIN_MULTIPLIER);
      const maxLog = Math.log10(axisMax);
      const valueLog = Math.log10(safeValue);

      return (valueLog - minLog) / Math.max(maxLog - minLog, 0.0001);
    };

    const getMultiplierY = (value: number, plot: PlotRect, axisMax: number) => {
      // Use a logarithmic Y-scale so higher multipliers stay readable
      // instead of compressing the upper half of the graph into a flat line.
      const ratio = getLogScaleRatio(value, axisMax);
      return plot.bottom - plot.height * ratio;
    };

    const getElapsedX = (elapsed: number, duration: number, plot: PlotRect) => {
      const progress = clamp(elapsed / Math.max(duration, 0.1), 0, 1);
      return plot.left + plot.width * progress;
    };

    const getDisplayedMultiplier = (elapsed: number, duration: number) => {
      const progress = clamp(elapsed / Math.max(duration, 0.1), 0, 1);
      // Strictly increasing from frame one:
      // y = 1 + k * (a * t + (1 - a) * t^2.15)
      // This removes the dip/flat launch while keeping a smooth acceleration.
      const launchGrowth = progress * 0.24 + 0.76 * Math.pow(progress, 2.15);
      return 1 + launchGrowth * (crashPoint.current - 1);
    };

    const getTrajectoryPoint = (elapsed: number, plot: PlotRect, duration: number, axisMax: number) => {
      const progress = clamp(elapsed / Math.max(duration, 0.1), 0, 1);
      const currentMultiplier = getDisplayedMultiplier(elapsed, duration);

      return {
        // Keep the X-axis progression moving immediately so the curve does not
        // appear to pause or form a flat horizontal segment at the origin.
        x: plot.left + plot.width * progress,
        y: getMultiplierY(currentMultiplier, plot, axisMax),
      };
    };

    const getTrajectoryAngle = (elapsed: number, plot: PlotRect, duration: number, axisMax: number) => {
      const delta = 1 / 60;
      const prev = getTrajectoryPoint(Math.max(0, elapsed - delta), plot, duration, axisMax);
      const next = getTrajectoryPoint(Math.min(duration, elapsed + delta), plot, duration, axisMax);
      return Math.atan2(next.y - prev.y, next.x - prev.x);
    };

    const drawPlane = (x: number, y: number, angle: number, scale: number, color: string) => {
      const canopyColor = "#141414";
      const accentColor = "rgba(255, 255, 255, 0.22)";

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.translate(26 * scale, -14 * scale);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(36 * scale, 0);
      ctx.quadraticCurveTo(31 * scale, -7 * scale, 22 * scale, -8 * scale);
      ctx.lineTo(10 * scale, -8 * scale);
      ctx.quadraticCurveTo(1 * scale, -8 * scale, -6 * scale, -4 * scale);
      ctx.lineTo(-15 * scale, -4 * scale);
      ctx.lineTo(-22 * scale, -1.5 * scale);
      ctx.lineTo(-26 * scale, -1.5 * scale);
      ctx.lineTo(-23 * scale, 0);
      ctx.lineTo(-26 * scale, 1.5 * scale);
      ctx.lineTo(-22 * scale, 1.5 * scale);
      ctx.lineTo(-15 * scale, 4 * scale);
      ctx.lineTo(-6 * scale, 4 * scale);
      ctx.quadraticCurveTo(2 * scale, 8 * scale, 12 * scale, 8 * scale);
      ctx.lineTo(22 * scale, 8 * scale);
      ctx.quadraticCurveTo(31 * scale, 7 * scale, 36 * scale, 0);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(11 * scale, 0);
      ctx.lineTo(-1 * scale, -2 * scale);
      ctx.lineTo(-16 * scale, -10 * scale);
      ctx.lineTo(-7 * scale, -11 * scale);
      ctx.lineTo(12 * scale, -4 * scale);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-10 * scale, 1.5 * scale);
      ctx.lineTo(-21 * scale, 8 * scale);
      ctx.lineTo(-14 * scale, 8.5 * scale);
      ctx.lineTo(-5 * scale, 4 * scale);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-16 * scale, -1 * scale);
      ctx.lineTo(-12 * scale, -10 * scale);
      ctx.lineTo(-8 * scale, -9 * scale);
      ctx.lineTo(-10 * scale, -1 * scale);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(18 * scale, -6.5 * scale);
      ctx.quadraticCurveTo(13 * scale, -14 * scale, 3 * scale, -11 * scale);
      ctx.lineTo(0 * scale, -6 * scale);
      ctx.lineTo(10 * scale, -5 * scale);
      ctx.closePath();
      ctx.fillStyle = canopyColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(11 * scale, -8 * scale);
      ctx.lineTo(6 * scale, -11 * scale);
      ctx.lineTo(2 * scale, -7.5 * scale);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.2 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2 * scale, 1.5 * scale);
      ctx.lineTo(17 * scale, 4.5 * scale);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.4 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(35 * scale, 0, 2.6 * scale, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(35 * scale, -14 * scale);
      ctx.quadraticCurveTo(38 * scale, -8 * scale, 35 * scale, 0);
      ctx.quadraticCurveTo(32 * scale, 8 * scale, 35 * scale, 14 * scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.2 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-18 * scale, 4 * scale);
      ctx.lineTo(-22 * scale, 9 * scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-22.5 * scale, 9.5 * scale, 1.6 * scale, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    };

    const drawCrashBurst = (x: number, y: number, progress: number) => {
      const alpha = 1 - progress;
      const radius = 10 + progress * 24;

      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(244, 63, 94, 0.24)";
      ctx.fill();

      for (let i = 0; i < 7; i++) {
        const burstAngle = (-Math.PI / 2) + (i / 7) * Math.PI * 1.7;
        const inner = 5 + progress * 6;
        const outer = 16 + progress * 20;

        ctx.beginPath();
        ctx.moveTo(x + Math.cos(burstAngle) * inner, y + Math.sin(burstAngle) * inner);
        ctx.lineTo(x + Math.cos(burstAngle) * outer, y + Math.sin(burstAngle) * outer);
        ctx.strokeStyle = "#fda4af";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawRoundedLabel = (x: number, y: number, text: string) => {
      ctx.save();
      ctx.font = "600 10px Inter, system-ui, sans-serif";
      const metrics = ctx.measureText(text);
      const width = metrics.width + 12;
      const height = 18;
      const radius = 9;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fillStyle = "rgba(17, 24, 39, 0.78)";
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 63, 94, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(244, 63, 94, 0.92)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + 6, y + height / 2 + 0.5);
      ctx.restore();
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const now = Date.now();
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const plot = getPlotRect(w, h);
      const flightPlot = getFlightPlotRect(plot, w);
      const axisMax = getAxisMaxMultiplier(crashPoint.current, w);
      const yAxisLevels = getYAxisLevels(axisMax, w);

      ctx.clearRect(0, 0, w, h);

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

      const flightDuration = getFlightDuration(crashPoint.current);
      const rawElapsed = (now - startTime.current) / 1000;
      const maxTick = Math.max(2, Math.ceil(flightDuration));
      const showTextTicks = w >= 520;
      const tickStep = w < 420 ? 2 : 1;
      const currentDisplayedMultiplier =
        gameState === "waiting"
          ? multiplier
          : gameState === "crashed"
          ? crashPoint.current
          : getDisplayedMultiplier(Math.min(rawElapsed, flightDuration), flightDuration);
      const currentGuideY = getMultiplierY(currentDisplayedMultiplier, plot, axisMax);

      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
      ctx.lineWidth = 1;
      ctx.font = `${w < 640 ? 10 : 11}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(255, 255, 255, 0.08)";
      ctx.shadowBlur = 5;

      yAxisLevels.forEach((level) => {
        const y = getMultiplierY(level, plot, axisMax);
        ctx.beginPath();
        ctx.moveTo(plot.left, y);
        ctx.lineTo(plot.right, y);
        ctx.stroke();

        ctx.fillStyle = Math.abs(level - currentDisplayedMultiplier) < 0.08 ? "rgba(244, 63, 94, 0.9)" : "rgba(203, 213, 225, 0.7)";
        ctx.textAlign = "right";
        ctx.fillText(`${level.toFixed(1)}x`, plot.left - 8, y);
      });

      for (let tick = 0; tick <= maxTick; tick += tickStep) {
        const elapsedX = getElapsedX(tick, flightDuration, flightPlot);

        ctx.beginPath();
        ctx.moveTo(elapsedX, plot.top);
        ctx.lineTo(elapsedX, plot.bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(elapsedX, plot.bottom);
        ctx.lineTo(elapsedX, plot.bottom + 5);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
        ctx.stroke();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";

        if (showTextTicks || tick === 0 || tick === maxTick) {
          ctx.fillStyle = "rgba(203, 213, 225, 0.58)";
          ctx.textAlign = tick === 0 ? "left" : tick === maxTick ? "right" : "center";
          ctx.fillText(`${tick}s`, elapsedX, plot.bottom + 14);
        }
      }

      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(244, 63, 94, 0.18)";
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(plot.left, currentGuideY);
      ctx.lineTo(plot.right, currentGuideY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      if (gameState === "waiting") {
        drawRoundedLabel(plot.left + 6, currentGuideY - 9, `${multiplier.toFixed(2)}x`);
        return;
      }

      if (gameState === "running" && rawElapsed >= flightDuration) {
        crashStartedAtRef.current = now;
        clearRoundTimers();
        setMultiplier(Math.round(crashPoint.current * 100) / 100);
        setGameState("crashed");

        nextRoundTimeoutRef.current = setTimeout(() => {
          nextRoundTimeoutRef.current = null;
          setGameState("waiting");
          setCountdown(5);

          countdownIntervalRef.current = setInterval(() => {
            setCountdown((current) => {
              if (current <= 1) {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                  countdownIntervalRef.current = null;
                }

                startTime.current = Date.now();
                crashStartedAtRef.current = null;
                crashPoint.current = 1.2 + Math.random() * 15;
                setMultiplier(1);
                setGameState("running");
                return 0;
              }

              return current - 1;
            });
          }, 1000);
        }, NEXT_ROUND_DELAY);

        return;
      }

      const elapsed = Math.min(rawElapsed, flightDuration);
      const displayedMultiplier =
        gameState === "crashed" ? crashPoint.current : getDisplayedMultiplier(elapsed, flightDuration);
      const roundedMultiplier = Math.round(displayedMultiplier * 100) / 100;
      setMultiplier((prev) => (prev === roundedMultiplier ? prev : roundedMultiplier));

      const points: [number, number][] = [];
      const sampleCount = Math.max(24, Math.ceil((elapsed / Math.max(flightDuration, 0.1)) * 220));
      for (let i = 0; i <= sampleCount; i++) {
        const sampleElapsed = elapsed * (i / sampleCount);
        const point = getTrajectoryPoint(sampleElapsed, flightPlot, flightDuration, axisMax);
        points.push([point.x, point.y]);
      }

      const tipPoint = getTrajectoryPoint(elapsed, flightPlot, flightDuration, axisMax);
      const tipAngle = getTrajectoryAngle(elapsed, flightPlot, flightDuration, axisMax);
      const trailPoints = points.slice(-18);

      const fillGradient = ctx.createLinearGradient(plot.left, plot.bottom, plot.left, plot.top);
      fillGradient.addColorStop(0, "rgba(220, 38, 38, 0.03)");
      fillGradient.addColorStop(0.45, "rgba(220, 38, 38, 0.18)");
      fillGradient.addColorStop(1, "rgba(236, 72, 153, 0.24)");

      ctx.beginPath();
      ctx.moveTo(plot.left, plot.bottom);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(points[points.length - 1][0], plot.bottom);
      ctx.closePath();
      ctx.fillStyle = fillGradient;
      ctx.fill();

      if (trailPoints.length > 1) {
        const [trailStartX, trailStartY] = trailPoints[0];
        const trailGradient = ctx.createLinearGradient(trailStartX, trailStartY, tipPoint.x, tipPoint.y);
        trailGradient.addColorStop(0, "rgba(244, 63, 94, 0)");
        trailGradient.addColorStop(1, "rgba(244, 63, 94, 0.55)");

        ctx.beginPath();
        trailPoints.forEach(([x, y], index) => {
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 11;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = gameState === "crashed" ? "#fb7185" : "#f43f5e";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      drawRoundedLabel(plot.left + 6, currentGuideY - 9, `${roundedMultiplier.toFixed(2)}x`);
      const takeoffScale = 0.72 + clamp(elapsed / 0.38, 0, 1) * 0.28;
      const distanceScale = 0.94 + ((tipPoint.x - flightPlot.left) / Math.max(flightPlot.width, 1)) * 0.16;
      const planeScale = takeoffScale * distanceScale;

      if (gameState === "running") {
        drawPlane(tipPoint.x, tipPoint.y, tipAngle, planeScale, "#f43f5e");
      } else if (crashStartedAtRef.current) {
        const crashElapsed = (now - crashStartedAtRef.current) / 1000;
        const crashProgress = clamp(crashElapsed / CRASH_BURST_DURATION, 0, 1);
        if (crashProgress < 1) {
          if (crashProgress < 0.18) {
            ctx.save();
            ctx.globalAlpha = 1 - crashProgress / 0.18;
            drawPlane(tipPoint.x, tipPoint.y, tipAngle, planeScale, "#f43f5e");
            ctx.restore();
          }

          drawCrashBurst(tipPoint.x, tipPoint.y, crashProgress);
        }
      }

      const crashBurstStillVisible =
        gameState === "crashed" &&
        crashStartedAtRef.current !== null &&
        (now - crashStartedAtRef.current) / 1000 < CRASH_BURST_DURATION;

      if (gameState === "running" || crashBurstStillVisible) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    if (gameState === "running" || gameState === "crashed") {
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
      className="relative flex-1 w-full rounded-xl border border-border/50 overflow-hidden animate-float-up min-h-[360px] lg:min-h-0"
      style={{ animationDelay: "0.3s" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

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

      <div className="absolute top-3 left-3">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            gameState === "running"
              ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
              : gameState === "crashed"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              gameState === "running"
                ? "bg-neon-green pulse-glow"
                : gameState === "crashed"
                ? "bg-primary"
                : "bg-neon-yellow pulse-glow"
            }`}
          />
          {gameState === "running" ? "Round in progress" : gameState === "crashed" ? "Crashed" : "Starting soon"}
        </div>
      </div>
    </div>
  );
};

export default CrashGraph;
