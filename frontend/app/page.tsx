"use client";

import { useState, useEffect, useRef } from "react";
import AddressSearch from "@/components/AddressSearch";
import PoolCanvas from "@/components/PoolCanvas";
import PoolCustomizer, { PoolShape } from "@/components/PoolCustomizer";
import ZoomSelector from "@/components/ZoomSelector";
import Toast from "@/components/Toast";

export default function Home() {
  const [imageUrl, setImageUrl]       = useState<string | null>(null);
  const [rawBlob, setRawBlob]         = useState<Blob | null>(null);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [rendering, setRendering]     = useState(false);
  const [shape, setShape]             = useState<PoolShape>("rectangle");
  const [color, setColor]             = useState("classic");
  const [zoom, setZoom]               = useState(19);
  const [coords, setCoords]           = useState<{ lat: number; lng: number } | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const isFirstRender                 = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!coords) return;
    fetchSatellite(coords.lat, coords.lng, zoom);
  }, [zoom]);

  const fetchSatellite = async (lat: number, lng: number, z: number) => {
    setLoading(true);
    setRenderedUrl(null);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      const imgRes = await fetch(`${base}/satellite/?lat=${lat}&lng=${lng}&zoom=${z}`);
      if (!imgRes.ok) throw new Error("Could not fetch satellite image");
      const blob = await imgRes.blob();
      setRawBlob(blob);
      setImageUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageReady = (url: string, blob: Blob, lat: number, lng: number) => {
    setImageUrl(url);
    setRawBlob(blob);
    setCoords({ lat, lng });
    setRenderedUrl(null);
  };

  const handleConfirm = async (draw: {
    startX: number; startY: number; endX: number; endY: number;
  }) => {
    if (!rawBlob) return;
    setRendering(true);
    try {
      const fd = new FormData();
      fd.append("image", rawBlob, "satellite.png");
      fd.append("x1", String(Math.min(draw.startX, draw.endX)));
      fd.append("y1", String(Math.min(draw.startY, draw.endY)));
      fd.append("x2", String(Math.max(draw.startX, draw.endX)));
      fd.append("y2", String(Math.max(draw.startY, draw.endY)));
      fd.append("shape", shape);
      fd.append("color", color);

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/render-pool/",
        { method: "POST", body: fd }
      );
      if (!res.ok) throw new Error("Render failed — please try again");
      setRenderedUrl(URL.createObjectURL(await res.blob()));
    } catch (err: any) {
      setToast(err.message);
    } finally {
      setRendering(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center gap-8 p-12">

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col items-center gap-1">
        <h1 className="text-4xl font-bold text-gray-900">Pool Drawer</h1>
        <p className="text-gray-500 text-sm">Visualize a pool in any backyard</p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <AddressSearch
          zoom={zoom}
          onImageReady={handleImageReady}
          onLoading={setLoading}
          onError={setToast}
        />
        <ZoomSelector value={zoom} onChange={setZoom} />
      </div>

      {loading && (
        <p className="text-gray-500 animate-pulse">Fetching satellite image...</p>
      )}

      {!imageUrl && !loading && (
        <div className="flex flex-col items-center gap-2 text-gray-400 mt-8">
          <p className="text-5xl">🛰️</p>
          <p className="text-sm">Enter an address to get started</p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="flex flex-col items-center gap-5 w-full">
          <PoolCustomizer
            shape={shape}
            color={color}
            onShapeChange={setShape}
            onColorChange={setColor}
          />
          <PoolCanvas
            imageUrl={imageUrl}
            shape={shape}
            zoom={zoom}
            lat={coords?.lat ?? 45}
            onConfirm={handleConfirm}
          />
        </div>
      )}

      {rendering && (
        <p className="text-gray-500 animate-pulse">Rendering your pool...</p>
      )}

      {renderedUrl && !rendering && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-green-700 font-semibold text-lg">Your pool</p>
          <img
            src={renderedUrl}
            alt="Rendered pool"
            width={640}
            height={640}
            className="rounded-2xl shadow-xl border border-gray-200"
          />
          <a
            href={renderedUrl}
            download="my-pool.png"
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
          >
            Download image
          </a>
        </div>
      )}
    </main>
  );
}