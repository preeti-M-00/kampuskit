import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import PdfSummary from "../models/PdfSummary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ML_URL = process.env.ML_URL || "http://127.0.0.1:5001";

// GET history
router.get("/history", async (req, res) => {
  try {
    const records = await PdfSummary.find().sort({ createdAt: -1 }).limit(20);
  res.json(records);
  } catch (err) {
    res.status(500).json({error:err.message});
  }
});

// DELETE history item
router.delete("/history/:id", async (req, res) => {
  try {
    await PdfSummary.findByIdAndDelete(req.params.id);
  res.json({ success: true });
  } catch (err) {
    res.status(500).json({error:err.message});
  }
});

router.post("/summarize", upload.single("pdf"), async (req, res) => {
  try {
    const length = req.body.length || "medium";
    const formData = new FormData();
    formData.append("pdf", req.file.buffer, req.file.originalname);
    formData.append("length", length);

    const flaskRes = await axios.post(`${ML_URL}/summarize-pdf`, formData, {
      headers: formData.getHeaders(),
      responseType: "arraybuffer",
      maxBodyLength: Infinity,
      timeout: 300_000,
    });

    const encoded = flaskRes.headers["x-summary-text"] || "";
    const plainText = encoded ? Buffer.from(encoded, "base64").toString("utf-8") : "";

    const sections = plainText.split("\n\n").filter(Boolean).map((block) => {
      const [heading, ...rest] = block.split("\n");
      return { heading: heading.trim(), text: rest.join(" ").trim() };
    });

    await PdfSummary.create({
      originalFileName: req.file.originalname,
      originalFileSize: req.file.size,
      summaryFileName: `summary-${req.file.originalname}`,
      summaryLength: length,
      sections,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=summary-${req.file.originalname}`,
      "X-Summary-Text": encoded,
      "Access-Control-Expose-Headers": "X-Summary-Text",
    });
    res.send(Buffer.from(flaskRes.data));
  } catch (err) {
    res.status(500).json({ error: "Summarization failed", detail: err.message });
  }
});

export default router;