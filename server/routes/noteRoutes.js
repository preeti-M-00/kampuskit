import express from "express";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.use(userAuth);

router.post("/", createNote);
router.get("/", getNotes);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;