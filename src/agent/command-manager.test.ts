import { CommandManager } from "./command-manager.js";

async function runTests() {
  console.log("Running CommandManager tests...");
  let passed = 0;
  let failed = 0;

  const manager = new CommandManager();
  
  // Mock internal state for testing
  (manager as any).commands = [{
    name: 'test',
    description: 'test command',
    parameters: { type: 'object', properties: { input: { type: 'string' } }, required: ['input'] },
    script: 'echo {{input}}',
    filePath: '/fake.md'
  }];

  // Test 1: Normal execution
  try {
    const script = manager.resolveScript('test', { input: 'hello' });
    if (script === "echo 'hello'") {
      passed++;
      console.log("✅ Test 1: Normal execution passed");
    } else {
      failed++;
      console.error(`❌ Test 1 failed: Expected "echo 'hello'", got "${script}"`);
    }
  } catch (e) {
    failed++;
    console.error("❌ Test 1 failed with error:", e);
  }

  // Test 2: Input with {{ }}
  try {
    const script = manager.resolveScript('test', { input: 'hello {{world}}' });
    if (script === "echo 'hello {{world}}'") {
      passed++;
      console.log("✅ Test 2: Input with {{ }} passed");
    } else {
      failed++;
      console.error(`❌ Test 2 failed: Expected "echo 'hello {{world}}'", got "${script}"`);
    }
  } catch (e) {
    failed++;
    console.error("❌ Test 2 failed with error:", e);
  }

  // Test 3: Missing required argument
  try {
    const script = manager.resolveScript('test', {});
    if (script === null) {
      passed++;
      console.log("✅ Test 3: Missing required argument passed");
    } else {
      failed++;
      console.error(`❌ Test 3 failed: Expected null, got "${script}"`);
    }
  } catch (e) {
    failed++;
    console.error("❌ Test 3 failed with error:", e);
  }

  // Test 4: Missing arguments using executeCommand should return specific error
  try {
    const result = await manager.executeCommand('test', {});
    if (result.success === false && result.error?.includes("Missing required arguments: input")) {
      passed++;
      console.log("✅ Test 4: executeCommand missing argument passed");
    } else {
      failed++;
      console.error(`❌ Test 4 failed: Expected missing arg error, got:`, result);
    }
  } catch (e) {
    failed++;
    console.error("❌ Test 4 failed with error:", e);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
