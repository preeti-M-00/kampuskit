import mongoose from "mongoose"

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        default: "defaultUser",
        required: true
    },
    documentId: {
        type: String,
        // ref: 'Document',
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ["user","assistant"],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        relevantChunks: {
            type: [Number],
            default: []
        }
    }]
},
{timestamps: true}
);

// index for faster queries:  
chatHistorySchema.index({userId: 1, documentId: 1});

const ChatHistory = mongoose.model('ChatHistory',chatHistorySchema);

export default ChatHistory