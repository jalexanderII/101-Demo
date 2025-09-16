import { Router } from "express";
import { z } from "zod";

import { isSalesforceConfigured } from "../config";
import { getSampleAccounts, runSoql } from "../salesforce/client";

const router = Router();

const querySchema = z.object({
	query: z.string().min(1, "Query is required"),
});

router.get("/status", (_req, res) => {
	res.json({ 
		configured: isSalesforceConfigured,
		missing: isSalesforceConfigured ? [] : ["SALESFORCE_CLIENT_ID", "SALESFORCE_CLIENT_SECRET", "SALESFORCE_REFRESH_TOKEN"].filter(key => !process.env[key])
	});
});

router.get("/accounts", async (_req, res, next) => {
	if (!isSalesforceConfigured) {
		res.status(503).json({
			message:
				"Salesforce credentials are missing. Update your .env file to enable this endpoint.",
		});
		return;
	}
	try {
		const data = await getSampleAccounts();
		res.json(data);
	} catch (error) {
		next(error);
	}
});

router.post("/query", async (req, res, next) => {
	if (!isSalesforceConfigured) {
		res.status(503).json({
			message:
				"Salesforce credentials are missing. Update your .env file to enable queries.",
		});
		return;
	}
	try {
		const { query } = querySchema.parse(req.body);
		const data = await runSoql(query);
		res.json(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ message: "Invalid query", issues: error.issues });
			return;
		}
		next(error);
	}
});

export const salesforceRouter = router;
