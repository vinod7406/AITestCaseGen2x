import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const TEMPLATES_FILE = path.join(process.cwd(), 'data/templates.json');

// Ensure the templates file exists
if (!fs.existsSync(TEMPLATES_FILE)) {
    // Initial templates from the Project_02_Prompt_Templates folder
    const initialTemplates = [
        { id: 'vwo-functional', name: 'VWO Functional Template', content: 'Act as a QA. Generate functional test cases for the PRD below in a structured table table format (ID | Summary | Precondition | Steps | Expected Result).' },
        { id: 'vwo-negative', name: 'VWO Negative/Boundary Template', content: 'Act as a QA. Generate negative and boundary test cases for the requirement below. Focus on robustness and failure modes.' }
    ];
    fs.mkdirSync(path.dirname(TEMPLATES_FILE), { recursive: true });
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(initialTemplates, null, 2));
}

router.get('/', (req, res) => {
    try {
        const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read templates' });
    }
});

router.post('/', (req, res) => {
    try {
        const { name, content, category } = req.body;
        const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        const newTemplate = { id: Date.now().toString(), name, content, category: category || 'General' };
        templates.push(newTemplate);
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
        res.status(201).json(newTemplate);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save template' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, category } = req.body;
        let templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        const index = templates.findIndex((t: any) => t.id === id);
        if (index === -1) return res.status(404).json({ error: 'Template not found' });
        
        templates[index] = { ...templates[index], name, content, category };
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
        res.json(templates[index]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update template' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        let templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
        templates = templates.filter((t: any) => t.id !== id);
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

export default router;
