import 'dotenv/config';
import { createServerApp } from "./setup";
import { setupVite, log } from "./vite";

console.log("Starting Development Server...");

(async () => {
    const { app, server } = await createServerApp();

    await setupVite(app, server);

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5001', 10);
    server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
    }, () => {
        log(`serving dev on port ${port}`);
    });
})();
