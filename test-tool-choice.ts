
import axios from "axios";

async function testToolChoice() {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return;

  const payload = {
    model: "grok-4-1-fast-reasoning",
    input: "明日の天気を教えて",
    tools: [{ type: "web_search" }],
    tool_choice: "auto",
    stream: false
  };

  try {
    console.log("Testing with tool_choice: auto...");
    const res = await axios.post("https://api.x.ai/v1/responses", payload, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
    });
    console.log("Success!");
  } catch (e: any) {
    console.log("Error Status:", e.response?.status);
    console.log("Error Data:", JSON.stringify(e.response?.data, null, 2));
  }
}

testToolChoice();
