import express from "express";
import { MessageSelfController } from "@/controllers/messageControllers/messageController";

const router = express.Router();

router.get("/messages", MessageSelfController.getMessages);
router.post("/messages/seen", MessageSelfController.markMessageAsSeen);
router.get("/messages/self-check", MessageSelfController.checkSelfMessage);

export default router;
