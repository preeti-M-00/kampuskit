import express from "express";
import PdfSummary from "../models/PdfSummary.js";

const historyRouter = express.Router();

// GET /api/history  →  last 50 summaries, newest first
historyRouter.get("/", async (req, res) => {
  try {
    const records = await PdfSummary.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("originalFileName originalFileSize summaryLength sections createdAt");

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// DELETE /api/history/:id
historyRouter.delete("/:id", async (req, res) => {
  try {
    await PdfSummary.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete record" });
  }
});

export default historyRouter;
