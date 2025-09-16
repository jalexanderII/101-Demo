import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { env } from "./config";
import { authRouter } from "./routes/auth";
import { salesforceRouter } from "./routes/salesforce";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/api/salesforce", salesforceRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- express error signature
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
	console.error(error);
	res.status(500).json({ message: "Internal Server Error" });
});

app.listen(env.SERVER_PORT, () => {
	console.log(`Server running on port ${env.SERVER_PORT}`);
});
