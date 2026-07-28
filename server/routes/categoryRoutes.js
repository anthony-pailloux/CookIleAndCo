import { Router } from "express";
import { listCategory } from "../controllers/categoryController.js";

const router = Router();

router.get('/', listCategory);

export default router;