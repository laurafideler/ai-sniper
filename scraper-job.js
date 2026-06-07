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
  //https://www.auctionninja.com/category/sports-memorabilia-ephemera?keyword=baseball&miles=30&zip=01602&state=Massachusetts
  // Target the clean frontend directory instead of the .php backend action file
  const baseUrl =
    "https://www.auctionninja.com/category/sports-memorabilia-ephemera";
  const encodedKeyword = encodeURIComponent(keyword);

  // Exact structural query strings for the marketplace search query engine
  return `${baseUrl}?keyword=${encodedKeyword}&zip=${zipCode}&miles=${radius}`;
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
  debugger;
  for (const radar of radars) {
    console.log(`Searching for "${radar.keyword}" near ${radar.zip}...`);
    const searchUrl = generateSearchUrl(radar.keyword, radar.zip, radar.radius);
    console.log(searchUrl);
    try {
      console.log("🔍 DEBUG: Navigating to:", searchUrl);
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Add a small delay to ensure page is loaded
      await page.waitForTimeout(2000);

      // Check if we can find any elements
      const cardCount = await page.evaluate(() => {
        return document.querySelectorAll(".hot-items-box-in").length;
      });
      console.log("🔍 DEBUG: Found", cardCount, "cards on page");
      debugger;
      // Adjust selectors here to match actual classes on AuctionNinja
      const items = await page.evaluate((radarId) => {
        const cards = document.querySelectorAll(".hot-items-box-in");
        const matches = [];
        console.log("**** DEBUG: Processing", cards.length, "cards");
        cards.forEach((card) => {
          // Title from .hot-items-title a
          const titleElement = card.querySelector(".hot-items-title a");
          const title = titleElement?.innerText?.trim() || "";

          // Link from the same title element
          const link = titleElement?.href || "";

          // Current bid from the p element with id pattern CURBIDID_*
          const bidElement = card.querySelector('[id^="CURBIDID_"]');
          const bidText = bidElement?.innerText || "$0.00";

          // Time left from .day-leftinr span
          const timeElement = card.querySelector(".day-leftinr");
          const timeText = timeElement?.innerText?.trim() || "";

          // Thumbnail from img inside .hot-items-img
          const thumbnail = card.querySelector(".hot-items-img img")?.src || "";

          // Extract lot ID from link URL
          const lotId =
            link.split("/").pop()?.replace(".html", "") ||
            Math.random().toString();

          // Parse bid amount
          const bidAmount = parseFloat(bidText.replace(/[^0-9.]/g, "")) || 0;

          if (title && link) {
            matches.push({
              id: lotId,
              title,
              current_bid: bidAmount,
              end_time: timeText,
              link,
              thumbnail,
              radar_id: radarId,
            });
          }
        });
        console.log("**** DEBUG: Extracted matches:", matches);
        return matches;
      }, radar.id);

      console.log("🔍 DEBUG: Raw items extracted:", items.length, items);

      // Filter items locally matching our thresholds
      const filteredItems = items.filter((item) => {
        const currentBid = parseInt(item.current_bid) || 0;
        const maxBid = parseInt(radar.max_bid) || 0;
        const endTime = item.end_time.toLowerCase();

        // Check bid amount (ensure integer comparison)
        const bidMatch = currentBid <= maxBid;

        // Check time - accept auctions ending soon (hours, mins, or less than 1 day)
        const timeMatch =
          endTime.includes("min") ||
          endTime.includes("hour") ||
          (endTime.includes("day") && parseInt(endTime) <= 1);

        console.log(
          `🔍 DEBUG: ${item.title} - Bid: $${currentBid} <= $${maxBid}? ${bidMatch}, Time: ${endTime} matches? ${timeMatch}`,
        );

        return bidMatch;
      });

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
