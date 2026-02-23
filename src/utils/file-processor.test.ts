import { expandFilePaths } from "./file-processor.js";

async function runTests() {
  console.log("Running expandFilePaths tests...");
  let passed = 0;
  let failed = 0;

  // Test 1: Directory path (@src)
  try {
    const result = await expandFilePaths("@src What is this?");
    if (result.includes("--- Directory: src ---") && result.includes("agent/")) {
      passed++;
      console.log("✅ Test 1: Directory path passed");
    } else {
      failed++;
      console.error(`❌ Test 1 failed: Expected directory list, got:\n${result.slice(0, 100)}...`);
    }
  } catch (e) {
    failed++;
    console.error("❌ Test 1 failed with error:", e);
  }

  // Test 2: Invalid path (@nonexistent_hoge)
  try {
    const result = await expandFilePaths("@nonexistent_hoge");
    if (result.includes("Failed to read file at \"nonexistent_hoge\"")) {
      passed++;
      console.log("✅ Test 2: Nonexistent path passed (returned explicit error comment)");
    } else {
      failed++;
      console.error(`❌ Test 2 failed: Expected error comment, got "${result}"`);
    }
  } catch (e) {
    failed++;
    console.error("❌ Test 2 failed with error:", e);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
