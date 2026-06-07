require("dotenv").config({ path: ".env.local" }); // Load from .env.local file
const { createClient } = require("@supabase/supabase-js");
const { chromium } = require("playwright");
const ws = require("ws");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws,
    },
  },
);

// Helper function to build target URLs
function generateSearchUrl(keyword, zipCode, radius) {
  const baseUrl = "https://www.auctionninja.com/marketplace/search.browse";
  return `${baseUrl}?search=${encodeURIComponent(keyword)}&zip=${zipCode}&distance=${radius}`;
}

async function run() {
  console.log("🚀 Fetching active search radars...");
  const { data: radars, error } = await supabase
    .from("radars")
    .select("*")
    .eq("is_active", true);

  if (error || !radars || radars.length === 0) {
    console.log("No active radars to check.");
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });
  const page = await context.newPage();

  for (const radar of radars) {
    console.log(`Searching for "${radar.keyword}" near ${radar.zip}...`);
    const searchUrl = generateSearchUrl(radar.keyword, radar.zip, radar.radius);

    try {
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Adjust selectors here to match actual classes on AuctionNinja
      const items = await page.evaluate((radarId) => {
        const cards = document.querySelectorAll(".item-card-class"); // update to real UI card target selector
        const matches = [];

        cards.forEach((card) => {
          const title = card.querySelector(".title-class")?.innerText || "";
          const bidText =
            card.querySelector(".bid-amount-class")?.innerText || "$0";
          const link = card.querySelector("a")?.href || "";
          const timeText =
            card.querySelector(".time-left-class")?.innerText || "";
          const thumbnail = card.querySelector("img")?.src || "";

          const lotId = link.split("/").pop() || Math.random().toString();
          const bidAmount = parseFloat(bidText.replace(/[^0-9.]/g, "")) || 0;

          matches.push({
            id: lotId,
            title,
            current_bid: bidAmount,
            end_time: timeText,
            link,
            thumbnail,
            radar_id: radarId,
          });
        });
        return matches;
      }, radar.id);

      // Filter items locally matching our thresholds
      const filteredItems = items.filter(
        (item) =>
          item.current_bid <= radar.max_bid &&
          (item.end_time.includes("mins") || item.end_time.includes("min")),
      );

      if (filteredItems.length > 0) {
        console.log(
          `Found ${filteredItems.length} matching items. Writing to DB...`,
        );
        // upsert skips items already logged previously by matching primary key "id"
        const { error: upsertError } = await supabase
          .from("matched_lots")
          .upsert(filteredItems, { onConflict: "id" });
        if (upsertError) console.error("DB Upsert error:", upsertError);
      }
    } catch (err) {
      console.error(`Error scraping radar ID ${radar.id}:`, err.message);
    }
  }

  await browser.close();
  console.log("🏁 Scrape job finished safely.");
}

run();
