import 'dotenv/config';
import { createServerApp } from "./setup";
import { serveStatic, log } from "./utils";

(async () => {
  const { app, server } = await createServerApp();

  serveStatic(app);

  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving production on port ${port}`);
  });
})();
