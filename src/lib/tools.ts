import { toolDefinition } from "@tanstack/ai";
import z from "zod";

const MARKET_PRICE: Record<string, number> = {
  beef: 800,
  mutton: 1100,
  chicken_broiler: 200,
  chicken_deshi: 550,
  hilsa_fish: 1500,
  rui_fish: 450,
  onion: 120,
  potato: 60,
  polao_rice: 140,
  rice_miniket: 80,
  soybean_oil: 165,
  egg: 15, // per piece
};

const CheckMarketPrice = toolDefinition({
  name: "check_market_price",
  description:
    "Get the current market price (BDT) of a specific grocery item in Dhaka.",
  inputSchema: z.object({
    item_name: z
      .string()
      .describe(
        "The name of the item (e.g., 'onion', 'hilsa_fish', 'beef'). Convert user input to closest match."
      ),
  }),
});

export const checkMarketPriceTool = CheckMarketPrice.server(
  async ({ item_name }) => {
    // Normalize input to lowercase
    const key = item_name.toLowerCase().replace(" ", "_");

    //find price
    const price = MARKET_PRICE[key];

    if (!price) {
      return {
        status: "error",
        message: `Sorry, I don't have the market price information for '${item_name}'. Please try another item.`,
      };
    }
    //if founded
    return {
      item: item_name,
      price_bdt: price,
      unit: key === "egg" ? "per piece" : "per kg",
    };
  }
);
