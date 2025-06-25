//frontend/src/models/story.js
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster lookups
    },
    mediaUrl: {
        type: String,
        required: true,
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image',
    },
    expiresAt: {
        type: Date,
        required: true,
        // Create a TTL (Time-to-Live) index. MongoDB will automatically
        // delete documents from this collection '0' seconds after their 'expiresAt' time.
        expires: 0, 
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

module.exports = mongoose.model('story', storySchema);