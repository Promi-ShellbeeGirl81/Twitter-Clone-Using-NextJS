import express from "express";
import { MessageSeenController } from "@/controllers/messageControllers/messageController";

const router = express.Router();

router.get("/messages", MessageSeenController.getMessages);
router.post("/messages/seen", MessageSeenController.markMessageAsSeen);

export default router;
