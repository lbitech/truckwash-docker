import express from "express";
import { registerRoutes } from "./routes";

export async function createServerApp() {
    const app = express();

    app.use(express.json({
        limit: '50mb',
        verify: (req, _res, buf) => {
            (req as any).rawBody = buf;
        }
    }));
    app.use(express.urlencoded({ extended: false, limit: '50mb' }));

    app.use((req, res, next) => {
        const start = Date.now();
        const path = req.path;
        let capturedJsonResponse: Record<string, any> | undefined = undefined;

        const originalResJson = res.json;
        res.json = function (bodyJson, ...args) {
            capturedJsonResponse = bodyJson;
            return originalResJson.apply(res, [bodyJson, ...args]);
        };

        res.on("finish", () => {
            const duration = Date.now() - start;
            if (path.startsWith("/api")) {
                let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                if (capturedJsonResponse) {
                    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                }

                if (logLine.length > 80) {
                    logLine = logLine.slice(0, 79) + "…";
                }

                console.log(logLine);
            }
        });

        next();
    });

    const server = await registerRoutes(app);

    return { app, server };
}
