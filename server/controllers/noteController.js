// const Note = require("../models/noteModel");
import Note from "../models/noteModel.js";

// create note
export const createNote = async (req,res)=>{
    try {
        const {title,content,tags, type, todos} = req.body;

        const note = new Note({
            user: req.userId,
            title,
            content: type === "note" ? content || "" : "",
            tags: tags || [],
            type: type || "note",
            todos: type === "todo" ? todos || [] : []
        });

        const savedNote = await note.save();
        res.status(201).json(savedNote);

        // const note = await Note.create({
        //     user:req.userId,
        //     title,
        //     content,
        //     tags,
        // });
        // res.status(201).json(note);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
};

// get all notes (only for logged user)
export const getNotes = async (req,res) => {
    try {
        const notes = await Note.find({user:req.userId}).sort({createdAt:-1});
        res.json(notes);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
};

// update note
export const updateNote = async (req,res) => {
    try {
        const {title, content, tags, type, todos} = req.body;

        const note = await Note.findById(req.params.id);

        if(!note){
            return res.status(404).json({message:"Note not found"});
        }

        if(note.user.toString()!== req.userId){
            return res.status(401).json({message:"Note authorized"});
        }

        note.title = title;
        note.tags = tags;
        note.type = type;

        if(type==="note"){
            note.content = content || "";
            note.todos = [];
        }

        if(type==="todo"){
            note.content = "";
            note.todos = todos || [];
        }

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};

// delete note
export const deleteNote = async (req,res) => {
    try {
        const note = await Note.findById(req.params.id);

        if(!note) return res.status(404).json({message:"Note not found"});

        if(note.user.toString()!==req.userId){
            return res.status(401).json({message:"Not authorized"});
        }

        await note.deleteOne();

        res.json({message:"Note deleted"});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};