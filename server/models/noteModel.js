import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    // 🔥 NEW FIELD
    type: {
      type: String,
      enum: ["note", "todo"],
      default: "note"
    },

    content: {
      type: String,
      default: ""
    },

    // 🔥 NEW FIELD
    todos: {
      type: [todoSchema],
      default: []
    },

    tags: {
      type: [String],
      default: []
    },

    isPinned: {
      type: Boolean,
      default: false
    },

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;