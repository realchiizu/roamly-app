import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { flight_number, date } = await req.json();
    if (!flight_number) {
      return new Response(JSON.stringify({ error: "flight_number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("AVIATIONSTACK_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AVIATIONSTACK_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      flight_iata: flight_number.toUpperCase().replace(/\s/g, ""),
    });

    const url = `http://api.aviationstack.com/v1/flights?${params}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.error) {
      console.error("Aviationstack error:", result.error);
      return new Response(JSON.stringify({ flight: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flights = result.data || [];
    let match = flights[0];
    if (date && flights.length > 1) {
      const dateMatch = flights.find((f: any) =>
        f.flight_date === date || f.departure?.scheduled?.startsWith(date)
      );
      if (dateMatch) match = dateMatch;
    }

    if (!match) {
      return new Response(JSON.stringify({ flight: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flightData = {
      airline: match.airline?.name || "",
      departure_time: match.departure?.scheduled
        ? new Date(match.departure.scheduled).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "",
      arrival_time: match.arrival?.scheduled
        ? new Date(match.arrival.scheduled).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "",
      terminal: match.departure?.terminal || "",
      gate: match.departure?.gate || "",
      origin: match.departure?.iata || "",
      destination: match.arrival?.iata || "",
    };

    return new Response(JSON.stringify({ flight: flightData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flight lookup error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
