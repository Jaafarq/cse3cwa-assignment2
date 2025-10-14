// Minimal instrumentation demo: log when the app boots in different environments
export async function register() {
    // This file is loaded by Next.js at start (edge/server)
    console.log("[instrumentation] register called:", {
      env: process.env.NODE_ENV,
      time: new Date().toISOString(),
    });
  }
  