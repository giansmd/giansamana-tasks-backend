import "dotenv/config";
import { startHttpServer } from "./server.js";

async function main(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);
  await startHttpServer(port);
  console.log(`HTTP server listening on http://localhost:${port}`);
}

main().catch((error) => {
  console.error("Failed to start HTTP server", error);
  process.exit(1);
});
