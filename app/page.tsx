"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  Radio,
  Bell,
  MapPin,
  DollarSign,
  ExternalLink,
} from "lucide-react";

export default function Dashboard() {
  // UI States loaded dynamically from Supabase
  const [radars, setRadars] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  // Form States
  const [keyword, setKeyword] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("25");
  const [maxBid, setMaxBid] = useState("20");
  const [loading, setLoading] = useState(false);

  // 1. Fetch Radars and Matches from the backend when page boots up
  const fetchData = async () => {
    try {
      const radarResponse = await fetch("/api/radars");
      const radarData = await radarResponse.json();
      if (!radarData.error) setRadars(radarData);

      // Fetch matches from the database
      const matchResponse = await fetch("/api/matches");
      const matchData = await matchResponse.json();
      if (!matchData.error) setMatches(matchData);
    } catch (err) {
      console.error("Error loading initial database layers:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Hook up the "Activate Radar" button directly to the POST API
  const handleAddRadar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !zip) return;

    setLoading(true);

    const newRadarPayload = {
      keyword,
      zip,
      radius: parseInt(radius),
      max_bid: parseFloat(maxBid),
      is_active: true,
    };

    try {
      const response = await fetch("/api/radars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRadarPayload),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh local state lists seamlessly
        setRadars([result[0], ...radars]);

        // Reset form controls
        setKeyword("");
        setZip("");
      } else {
        alert(`Database Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to commit radar row:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Optional: Delete Radar hook
  const handleDeleteRadar = async (id: number) => {
    try {
      const response = await fetch(`/api/radars?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRadars(radars.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete radar row:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Radio className="text-sky-600 animate-pulse" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">
            It&apos;s not stolen 🐦‍⬛
            <span className="text-xs bg-sky-500/20 text-sky-600 px-2 py-0.5 rounded-full font-normal">
              Give me your shiny things
            </span>
          </h1>
        </div>
        <div className="text-sm text-slate-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></span>{" "}
          Sync Connected
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell size={18} className="text-sky-600" /> Find Shiny Things
            </h2>
            <form onSubmit={handleAddRadar} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                  Keyword
                </label>
                <input
                  type="text"
                  required
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Vintage Cards, Cast Iron..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="01604"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                    Radius (mi)
                  </label>
                  <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                  Max Bid Price ($)
                </label>
                <input
                  type="number"
                  value={maxBid}
                  onChange={(e) => setMaxBid(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 transition-colors py-2 rounded-lg font-medium text-sm mt-2 text-white"
              >
                {loading ? "Finding Shiny Things..." : "Caw!"}
              </button>
            </form>
          </div>

          {/* Active Radars List from DB */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Shiny lists ({radars.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {radars.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">
                  No active database targets found.
                </p>
              ) : (
                radars.map((r: any) => (
                  <div
                    key={r.id}
                    className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-sm">{r.keyword}</p>
                      <div className="flex gap-3 text-xs text-slate-600 mt-1">
                        <span className="flex items-center gap-0.5">
                          <MapPin size={12} /> {r.zip} (+{r.radius}m)
                        </span>
                        <span className="flex items-center gap-0.5">
                          <DollarSign size={12} /> Max ${r.max_bid}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRadar(r.id)}
                      className="text-slate-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Target Snipe Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
            Queue ({matches.length})
          </h2>
          {matches.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500 text-sm bg-slate-50/50">
              Your queue is currently clear. Once your GitHub Actions worker
              runs its scraping loop, matches under your criteria will populate
              here instantly.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="p-4 flex gap-4">
                    <img
                      src={
                        item.thumbnail ||
                        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=150"
                      }
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm line-clamp-2 pt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {item.end_time}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-100/80 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-600 block uppercase font-medium">
                        Current Bid
                      </span>
                      <span className="text-lg font-bold text-sky-600">
                        ${item.current_bid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition-colors"
                      >
                        Bid <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
