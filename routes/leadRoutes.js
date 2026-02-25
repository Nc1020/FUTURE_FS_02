const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../jsonDb');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/leads/public
// @desc    Create a new lead from public form
// Access:  Public
router.post('/public', (req, res) => {
    try {
        const leads = readDB();
        const newLead = {
            id: uuidv4(),
            ...req.body,
            status: 'New',
            assignedTo: null, // Unassigned
            createdBy: 'public',
            createdAt: new Date().toISOString(),
            notes: []
        };
        leads.push(newLead);
        writeDB(leads);
        res.json(newLead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/leads
// @desc    Create a new lead (Internal)
// Access:  Private (Sales/Admin)
router.post('/', auth, (req, res) => {
    try {
        const leads = readDB();
        const newLead = {
            id: uuidv4(),
            ...req.body,
            status: 'New',
            assignedTo: req.user.role === 'sales' ? req.user.id : (req.body.assignedTo || null),
            createdBy: req.user.id,
            createdAt: new Date().toISOString(),
            notes: []
        };
        leads.push(newLead);
        writeDB(leads);
        res.json(newLead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/leads
// @desc    Get all leads
// Access:  Private
router.get('/', auth, (req, res) => {
    try {
        let leads = readDB();

        // RBAC Logic
        if (req.user.role === 'admin') {
            // Admin sees all
        } else if (req.user.role === 'sales') {
            // Sales sees only their own
            leads = leads.filter(lead => lead.assignedTo === req.user.id);
        } else {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Sort by createdAt desc
        leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(leads);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/leads/:id
// @desc    Update lead
// Access:  Private
router.patch('/:id', auth, (req, res) => {
    try {
        const leads = readDB();
        const leadIndex = leads.findIndex(l => l.id === req.params.id || l._id === req.params.id);

        if (leadIndex === -1) {
            return res.status(404).json({ msg: 'Lead not found' });
        }

        const lead = leads[leadIndex];

        // Check ownership
        if (req.user.role !== 'admin' && lead.assignedTo !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to edit this lead' });
        }

        const { status, note, assignedTo } = req.body;

        // Admin can reassign
        if (assignedTo && req.user.role === 'admin') {
            lead.assignedTo = assignedTo;
        }

        if (status) lead.status = status;
        if (note) {
            lead.notes.push({
                text: note,
                author: req.user.username,
                createdAt: new Date().toISOString()
            });
        }

        writeDB(leads);
        res.json(lead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// Access:  Private (Admin only)
router.delete('/:id', auth, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin only' });
    }

    try {
        let leads = readDB();
        leads = leads.filter(l => l.id !== req.params.id && l._id !== req.params.id);
        writeDB(leads);
        res.json({ msg: 'Lead removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
