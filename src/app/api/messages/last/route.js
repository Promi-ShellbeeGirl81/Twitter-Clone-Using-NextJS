import express from "express";
import { MessageLastController } from  "@/controllers/messageControllers/messageController";

const router = express.Router();

router.get("/messages", MessageLastController.getMessages);

export default router;
