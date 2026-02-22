
import axios from "axios";
import { GROK_TOOLS } from "./src/grok/tools.js";

async function testAllTools() {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return;

  const toolPayload = GROK_TOOLS.map(t => {
    if (t.type === "function") {
      return {
        type: "function",
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters
      };
    }
    return t;
  });

  const payload = {
    model: "grok-4-1-fast-reasoning",
    input: "明日の天気を教えて",
    tools: toolPayload,
    stream: false
  };

  try {
    console.log(`Testing with ${toolPayload.length} tools...`);
    const res = await axios.post("https://api.x.ai/v1/responses", payload, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
    });
    console.log("Success!");
  } catch (e: any) {
    console.log("Error Status:", e.response?.status);
    console.log("Error Data:", JSON.stringify(e.response?.data, null, 2));
  }
}

testAllTools();
