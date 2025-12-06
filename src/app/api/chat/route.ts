import { checkMarketPriceTool } from "@/lib/tools";
import { chat, toStreamResponse } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";

export async function POST(req: Request) {
  // Check for API key (security check)
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY not configured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  //parse request body
  const { messages } = await req.json();

  //define system message
  const systemMessage = {
    role: "system",
    content: `You are 'Bajar Bondhu', a helpful Bangladeshi market assistant. 
    - You help people calculate costs for cooking.
    - Always answer in BDT (Taka). 
    - You can answer in English or Bengali.
    - Use the 'check_market_price' tool to get real data. Do not guess prices.`,
  };

  try {
    // Create a streaming chat response
    const stream = chat({
      adapter: openai(),
      model: "gpt-4o",
      messages: [systemMessage, ...messages], //Prepend the system message to the incoming message list
      tools: [checkMarketPriceTool],
    });
    // Convert stream to HTTP response
    return toStreamResponse(stream);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
