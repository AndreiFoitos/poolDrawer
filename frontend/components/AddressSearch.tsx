"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useRef, useState } from "react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressSearchProps {
  zoom: number;
  onImageReady: (imageUrl: string, blob: Blob, lat: number, lng: number) => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string) => void;
}

export default function AddressSearch({ zoom, onImageReady, onLoading, onError }: AddressSearchProps) {
  const [address, setAddress]               = useState("");
  const [suggestions, setSuggestions]       = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debouncedAddress                    = useDebounce(address, 350);
  const containerRef                        = useRef<HTMLDivElement>(null);

  // Fetch suggestions as user types
  useEffect(() => {
    let cancelled = false;

    if (debouncedAddress.trim().length >= 3) {
      const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedAddress)}&format=json&limit=5`,
            { headers: { "User-Agent": "PoolDrawer/1.0" } }
          );
          const data: Suggestion[] = await res.json();
          if (!cancelled) {
            setSuggestions(data);
            setShowDropdown(true);
          }
        } catch {
          if (!cancelled) setSuggestions([]);
        } finally {
          if (!cancelled) setLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    } else {
      // Use a timeout so setState is not called synchronously in the effect body
      const t = setTimeout(() => {
        if (!cancelled) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSuggestions([]);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShowDropdown(false);
        }
      }, 0);
      return () => { cancelled = true; clearTimeout(t); };
    }

    return () => { cancelled = true; };
  }, [debouncedAddress]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchImage = async (lat: number, lng: number) => {
    onLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      const imgRes = await fetch(`${base}/satellite/?lat=${lat}&lng=${lng}&zoom=${zoom}`);
      if (!imgRes.ok) throw new Error("Could not fetch satellite image");
      const blob = await imgRes.blob();
      onImageReady(URL.createObjectURL(blob), blob, lat, lng);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      onLoading(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    setAddress(suggestion.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    await fetchImage(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
  };

  const handleSearch = async () => {
    if (address.trim().length < 3) return;
    setShowDropdown(false);

    onLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      const geoRes = await fetch(`${base}/geocode/?address=${encodeURIComponent(address)}`);
      if (!geoRes.ok) throw new Error("Address not found");
      const { lat, lng } = await geoRes.json() as { lat: number; lng: number };
      await fetchImage(lat, lng);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Unknown error");
      onLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full" ref={containerRef}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setShowDropdown(false);
            }}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Enter an address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {loadingSuggestions && (
            <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}

          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 truncate"
                  title={s.display_name}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </div>
  );
}