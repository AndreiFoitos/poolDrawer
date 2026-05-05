"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PoolShape } from "./PoolCustomizer";

interface DrawState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface PoolCanvasProps {
  imageUrl: string;
  shape: PoolShape;
  zoom: number;
  lat: number;
  onConfirm: (draw: DrawState) => void;
}

// Real-world meters per pixel at a given zoom + latitude
function metersPerPixel(zoom: number, lat: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

function formatSize(px: number, mpp: number): string {
  const m = Math.abs(px * mpp);
  return m >= 1 ? `${m.toFixed(1)}m` : `${(m * 100).toFixed(0)}cm`;
}

export default function PoolCanvas({ imageUrl, shape, zoom, lat, onConfirm }: PoolCanvasProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const drawState   = useRef<DrawState | null>(null);
  const [drawing, setDrawing]       = useState(false);
  const [confirmed, setConfirmed]   = useState(false);
  const [sizeLabel, setSizeLabel]   = useState<string | null>(null);
  // Track whether there is a drawing via state (not ref) so the button can react
  const [hasDrawing, setHasDrawing] = useState(false);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Define clearCanvas with useCallback BEFORE the useEffect that uses it
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    drawState.current = null;
    setConfirmed(false);
    setSizeLabel(null);
    setHasDrawing(false);
  }, []);

  useEffect(() => { clearCanvas(); }, [shape, clearCanvas]);

  const drawShape = (ctx: CanvasRenderingContext2D, s: DrawState) => {
    const { startX, startY, endX, endY } = s;
    const w = endX - startX;
    const h = endY - startY;
    const cx = startX + w / 2;
    const cy = startY + h / 2;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "rgba(0, 150, 255, 0.45)";
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 3;

    if (shape === "rectangle") {
      ctx.beginPath();
      ctx.rect(startX, startY, w, h);
      ctx.fill(); ctx.stroke();

    } else if (shape === "oval") {
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

    } else if (shape === "kidney") {
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.05, startY + h * 0.3, Math.abs(w * 0.45), Math.abs(h * 0.32), 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.05, startY + h * 0.7, Math.abs(w * 0.38), Math.abs(h * 0.28), 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

    } else if (shape === "lshape") {
      const x1 = Math.min(startX, endX);
      const y1 = Math.min(startY, endY);
      ctx.beginPath();
      ctx.rect(x1, y1, w * 0.5, h);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.rect(x1, y1 + h * 0.6, w, h * 0.4);
      ctx.fill(); ctx.stroke();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoords(e);
    drawState.current = { startX: x, startY: y, endX: x, endY: y };
    setDrawing(true);
    setConfirmed(false);
    setSizeLabel(null);
    setHasDrawing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !drawState.current) return;
    const { x, y } = getCoords(e);
    drawState.current = { ...drawState.current, endX: x, endY: y };
    drawShape(canvasRef.current!.getContext("2d")!, drawState.current);
  };

  const handleMouseUp = () => {
    setDrawing(false);
    if (drawState.current) {
      setHasDrawing(true);
      const mpp = metersPerPixel(zoom, lat);
      const { startX, startY, endX, endY } = drawState.current;
      const w = formatSize(endX - startX, mpp);
      const h = formatSize(endY - startY, mpp);
      setSizeLabel(`${w} x ${h}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-gray-500">Click and drag to place your pool</p>

      <div className="relative" style={{ width: 640, height: 640 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Satellite view" width={640} height={640} className="rounded-xl" />
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          className="absolute top-0 left-0 rounded-xl cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {sizeLabel && (
        <p className="text-sm font-medium text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
          Pool size: {sizeLabel}
        </p>
      )}

      <div className="flex gap-3">
        <button onClick={clearCanvas} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
          Clear
        </button>
        <button
          onClick={() => {
            if (drawState.current) {
              setConfirmed(true);
              onConfirm(drawState.current);
            }
          }}
          disabled={!hasDrawing || confirmed}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40"
        >
          {confirmed ? "Pool placed" : "Confirm pool"}
        </button>
      </div>
    </div>
  );
}