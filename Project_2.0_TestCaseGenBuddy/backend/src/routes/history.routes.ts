import { Router } from 'express';
import * as historyService from '../services/history.service.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const history = await historyService.getHistory();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const entry = await historyService.saveHistoryEntry(req.body);
    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await historyService.deleteHistoryEntry(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
