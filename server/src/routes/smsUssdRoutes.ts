import { Router } from 'express';
import { handleSmsWebhook, handleUssdSession } from '../controllers/smsUssdController.js';

const router = Router();

router.post('/sms/webhook', handleSmsWebhook);
router.post('/ussd/session', handleUssdSession);

export default router;
