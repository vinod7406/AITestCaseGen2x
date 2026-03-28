import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const CONTEXT_FILE = path.join(process.cwd(), 'data/context_library.json');

// Ensure the context file exists
if (!fs.existsSync(CONTEXT_FILE)) {
    fs.mkdirSync(path.dirname(CONTEXT_FILE), { recursive: true });
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify([], null, 2));
}

router.get('/', (req, res) => {
    try {
        const contexts = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        res.json(contexts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read context items' });
    }
});

router.post('/', (req, res) => {
    try {
        const { title, type, content } = req.body;
        const contexts = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        const newItem = { id: Date.now().toString(), title, type, content, createdAt: new Date() };
        contexts.push(newItem);
        fs.writeFileSync(CONTEXT_FILE, JSON.stringify(contexts, null, 2));
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save context item' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        let contexts = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        contexts = contexts.filter((c: any) => c.id !== id);
        fs.writeFileSync(CONTEXT_FILE, JSON.stringify(contexts, null, 2));
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete context item' });
    }
});

export default router;
