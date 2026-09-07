import { readStock } from "@/web/lib/base-reader";
import { STOCKS } from "@/web/lib/stocks";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") ?? "NVDAc";
  if (!STOCKS.some((stock) => stock.ticker === ticker))
    return Response.json({ error: "Choose a listed stock." }, { status: 400 });
  try {
    return Response.json(await readStock(ticker), {
      headers: { "Cache-Control": "public, s-maxage=30, max-age=0" },
    });
  } catch {
    return Response.json(
      {
        error:
          "Public Base RPC could not return a recent, complete stock read. Retry in a moment.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
