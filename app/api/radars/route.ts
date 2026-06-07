import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

// GET route to load active search parameters
export async function GET() {
  const { data, error } = await supabase
    .from("radars")
    .select("*")
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST route to insert new parameters straight from your UI form
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from("radars").insert([body]).select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
