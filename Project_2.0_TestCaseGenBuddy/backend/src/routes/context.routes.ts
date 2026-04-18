import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const CONTEXT_FILE = path.join(process.cwd(), 'data/context_library.json');

// In-memory fallback for Vercel/Write-restricted environments
let inMemoryContexts: any[] = [
    {
        id: "ctx-1",
        title: "VWO Login PRD",
        type: "PRD",
        content: "Functional requirements for VWO Login: 1. Username/Password validation. 2. Remember me session handling. 3. 2FA for admin accounts.",
        createdAt: new Date()
    }
];

const loadContexts = () => {
    try {
        if (fs.existsSync(CONTEXT_FILE)) {
            return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error("Storage error:", e);
    }
    return inMemoryContexts;
};

const saveContexts = (contexts: any[]) => {
    inMemoryContexts = contexts;
    try {
        if (!fs.existsSync(path.dirname(CONTEXT_FILE))) {
            fs.mkdirSync(path.dirname(CONTEXT_FILE), { recursive: true });
        }
        fs.writeFileSync(CONTEXT_FILE, JSON.stringify(contexts, null, 2));
    } catch (e) {
        console.warn("Write ignored (likely read-only environment like Vercel):", e);
    }
};

router.get('/', (req, res) => {
    res.json(loadContexts());
});

router.post('/', (req, res) => {
    try {
        const { title, type, content, files } = req.body;
        const contexts = loadContexts();
        const newItem = { 
            id: Date.now().toString(), 
            title, 
            type, 
            content, 
            files: files || [],
            createdAt: new Date() 
        };
        contexts.push(newItem);
        saveContexts(contexts);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save context item' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        let contexts = loadContexts();
        contexts = contexts.filter((c: any) => c.id !== id);
        saveContexts(contexts);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete context item' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, content, files } = req.body;
        let contexts = loadContexts();
        const index = contexts.findIndex((c: any) => c.id === id);
        if (index !== -1) {
            contexts[index] = { 
                ...contexts[index], 
                title, 
                type, 
                content, 
                files: files || contexts[index].files || [],
                updatedAt: new Date() 
            };
            saveContexts(contexts);
            res.json(contexts[index]);
        } else {
            res.status(404).json({ error: 'Context not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update context item' });
    }
});

export default router;
