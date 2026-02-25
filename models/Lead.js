const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    source: {
        type: String, // e.g., 'Website Contact Form'
        default: 'Website Contact Form',
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Converted', 'Closed'],
        default: 'New',
    },
    notes: [
        {
            text: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Lead', LeadSchema);
