import { Router } from "express";
import { listOrigin } from "../controllers/originController.js";

const router = Router();

router.get('/', listOrigin);

export default router;