"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  Radio,
  Bell,
  MapPin,
  DollarSign,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

export default function Dashboard() {
  // UI States
  const [radars, setRadars] = useState([]);
  const [matches, setMatches] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("25");
  const [maxBid, setMaxBid] = useState("20");

  // Fetch your custom criteria and data links on load
  useEffect(() => {
    // In production, these would fetch from your Next.js local /api routes
    initSampleData();
  }, []);

  const initSampleData = () => {
    setRadars([
      { id: 1, keyword: "Mid Century", zip: "01604", radius: 25, max_bid: 45 },
      { id: 2, keyword: "Cast Iron", zip: "01604", radius: 10, max_bid: 15 },
    ]);
    setMatches([
      {
        id: "102931",
        title: "Vintage MCM Walnut Nightstand",
        current_bid: 12.0,
        end_time: "14 mins left",
        link: "#",
        thumbnail:
          "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=150",
        radar: "Mid Century",
      },
      {
        id: "102935",
        title: "Griswold #8 Skillet",
        current_bid: 0.0,
        end_time: "42 mins left",
        link: "#",
        thumbnail:
          "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=150",
        radar: "Cast Iron",
      },
    ]);
  };

  const handleAddRadar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !zip) return;
    const newRadar = {
      id: Date.now(),
      keyword,
      zip,
      radius: parseInt(radius),
      max_bid: parseFloat(maxBid),
    };
    setRadars([...radars, newRadar]);
    setKeyword("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Radio className="text-emerald-400 animate-pulse" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">
            AN-Sniper{" "}
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-normal">
              Local Engine
            </span>
          </h1>
        </div>
        <div className="text-sm text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Scraper
          Idle
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls & Configuration */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 shadow-xl bg-slate-800/40">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell size={18} className="text-amber-400" /> Add Search Radar
            </h2>
            <form onSubmit={handleAddRadar} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                  Keyword
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Oak Dresser, Vintage..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="01604"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                    Radius (mi)
                  </label>
                  <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                  Max Bid Price ($)
                </label>
                <input
                  type="number"
                  value={maxBid}
                  onChange={(e) => setMaxBid(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors py-2 rounded-lg font-medium text-sm mt-2"
              >
                Activate Radar
              </button>
            </form>
          </div>

          {/* Active Radars List */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Active Radars ({radars.length})
            </h3>
            <div className="space-y-2">
              {radars.map((r: any) => (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">{r.keyword}</p>
                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={12} /> {r.zip} (+{r.radius}m)
                      </span>
                      <span className="flex items-center gap-0.5">
                        <DollarSign size={12} /> Max ${r.max_bid}
                      </span>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Deals Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
            🎯 Target Snipe Queue ({matches.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((item: any) => (
              <div
                key={item.id}
                className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="p-4 flex gap-4">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg bg-slate-700 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                      {item.radar}
                    </span>
                    <h4 className="font-semibold text-sm line-clamp-2 pt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-rose-400 font-medium">
                      {item.end_time}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900/80 px-4 py-3 border-t border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Current Bid
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      $
                      {item.current_bid === 0
                        ? "0 (No Bids)"
                        : item.current_bid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      title="Dismiss Item"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-colors border border-slate-700"
                    >
                      <X size={16} />
                    </button>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Bid <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
