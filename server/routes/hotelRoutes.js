import express from "express";
import { searchHotels } from "../controllers/hotelController.js";

const router = express.Router();

router.post("/search", searchHotels);

export default router;
