import { Router } from 'express';
import { createObjectCsvStringifier } from 'csv-writer';
import * as historyService from '../services/history.service.js';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const history = await historyService.getHistory();
    const entry = history.find(h => h.id === req.params.id);

    if (!entry || entry.type !== 'test-case') {
      return res.status(404).json({ error: 'Test cases not found' });
    }

    const testCases = entry.output;
    if (!Array.isArray(testCases)) {
      return res.status(400).json({ error: 'Entry output is not a list of test cases' });
    }

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'summary', title: 'Summary' },
        { id: 'preconditions', title: 'Preconditions' },
        { id: 'steps', title: 'Steps' },
        { id: 'expectedResult', title: 'Expected Result' },
        { id: 'type', title: 'Type' },
      ]
    });

    const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(testCases);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=test-cases-${req.params.id}.csv`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
