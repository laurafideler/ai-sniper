import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

// GET route to load matches from the database
export async function GET() {
  const { data, error } = await supabase
    .from("matched_lots")
    .select("*")
    .order("found_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST route to insert new matches (for the scraper)
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("matched_lots")
    .insert([body])
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
