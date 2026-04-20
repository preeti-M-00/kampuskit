import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiStar } from "react-icons/fi";
import "./NotesPage.css";
import { useNavigate } from "react-router-dom";
import { BsPin, BsPinFill} from"react-icons/bs";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/notes`;

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const[searchQuery, setSearchQuery] = useState("");
  const[pinnedNotes, setPinnedNotes] = useState([]);

  const [noteType, setNoteType] = useState("note");
  const [todoItems, setTodoItems] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: ""
  });

  // ================= FETCH NOTES =================
  const fetchNotes = async () => {
    try {
      const res = await axios.get(API, { withCredentials: true });
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
  try {
    const payload = {
  title: formData.title,
  tags: formData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== ""),
  type: noteType,
  content: noteType === "note" ? formData.content : "",
  todos:
    noteType === "todo"
      ? todoItems.filter((item) => item.text.trim() !== "")
      : []
};

    console.log("Sending payload:",payload);
    if (noteType === "note") {
      payload.content = formData.content;
    }

    if (noteType === "todo") {
      payload.todos = todoItems.filter(
        (item) => item.text.trim() !== ""
      );
    }

    if (editingNote) {
      await axios.put(`${API}/${editingNote._id}`, payload, {
        withCredentials: true
      });
    } else {
      await axios.post(API, payload, {
        withCredentials: true
      });
    }

    setShowModal(false);
    setEditingNote(null);
    setTodoItems([]);
    setNoteType("note");
    setFormData({ title: "", content: "", tags: "" });

    fetchNotes();
  } catch (error) {
    console.error(error);
  }
};

  // ================= DELETE =================
  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`, { withCredentials: true });
    fetchNotes();
  };

  // ================= EDIT =================
  const handleEdit = (note) => {
    setEditingNote(note);
    setShowModal(true);
    setNoteType(note.type || "note");

    setFormData({
      title: note.title,
      content: note.content || "",
      tags: note.tags?.join(", ") || ""
    });

    if (note.type === "todo") {
      setTodoItems(note.todos || []);
    }
  };

  // ================= ADD CLICK =================
  const handleAddClick = () => {
    setEditingNote(null);
    setShowModal(true);
    setNoteType("note");
    setFormData({ title: "", content: "", tags: "" });
    setTodoItems([]);
  };

  // =============== TOGGLE PIN ============
  const togglePin = (id) => {
    if(pinnedNotes.includes(id)){
      setPinnedNotes(pinnedNotes.filter(noteId => noteId !== id));
    }
    else{
      setPinnedNotes([...pinnedNotes,id]);
    }
  };

  // ============== FILTERING NOTES ===========
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();

    const inTitle = note.title?.toLowerCase().includes(query);
    const inContent = note.content?.toLowerCase().includes(query);
    const inTags = note.tags?.some(tag =>
      tag.toLowerCase().includes(query)
    );

    const inTodos = note.todos?.some(todo =>
      todo.text.toLowerCase().includes(query)
    );

    return inTitle || inContent || inTags || inTodos;
  });

  // =============== SORT PINNED NOTES TO TOP ============ 
  const sortedNotes = [...filteredNotes].sort((a,b) => {
    const aPinned = pinnedNotes.includes(a._id);
    const bPinned = pinnedNotes.includes(b._id);

    if(aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });

  // ======= ADD HIGHLIGHT FUNCTION ======= 
  const highlightText = (text) => {
    if(!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part,i)=>
    regex.test(part)?(
      <span key={i} className="highlight">
        {part}
      </span>
    ):(
      part
    )
  );
  };

  return (
    <div className="notes-page">
      {/* HEADER */}
      <div className="notes-header">
        <div className="header-left">
          <button className="home-back-btn" onClick={() => navigate("/home")}>
            <FiArrowLeft/>
          </button>
          </div>
          <div className="title-row">
            <h1>NOTES APP</h1>

            <input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input"/>

            <button className="new-note-btn" onClick={handleAddClick}>
          <FiPlus /> New Note
        </button>
      </div>
       <div className="header-line"></div>
          </div>
        

      {/* EMPTY STATE */}
      {notes.length === 0 && (
        <div className="empty-wrapper">
          <div className="empty-icon">📒</div>
          <h2>No Notes yet</h2>
          <p>
            Ready to organize your thoughts? Create your first note
            to get started on your journey.
          </p>
          <button onClick={handleAddClick}>
            Create your first Note
          </button>
        </div>
      )}

      {/* NOTES GRID */}
      <div className="notes-grid">
        {sortedNotes.map((note) => (
      <div className="note-card" key={note._id}>
        <h3>{highlightText(note.title)}</h3>

    {/* NORMAL NOTE */}
    {note.type === "note" && (
      <p>{highlightText(note.content)}</p>
    )}

    {/* TODO NOTE */}
    {note.type === "todo" && (
      <div className="todo-list-display">
        {note.todos && note.todos.length > 0 ? (
          note.todos.map((todo, index) => (
            <div key={index} className="todo-item-display">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={async () => {
                    const updatedTodos = note.todos.map((t,i)=>i===index ? {...t, completed: !t.completed} : t);

                    try {
                        await axios.put(
                            `${API}/${note._id}`,
                            {
                                title:note.title,
                                tags:note.tags,
                                type:"todo",
                                todos:updatedTodos
                            },
                            {withCredentials:true}
                        );

                        fetchNotes();
                    } catch (error) {
                        console.error(error);
                    }
                }}
              />
              <span
                className={todo.completed ? "completed" : ""}
              >
                {highlightText(todo.text)}
              </span>
            </div>
          ))
        ) : (
          <p>No tasks</p>
        )}
      </div>
    )}

    {/* TAGS */}
    <div className="note-tags">
      {note.tags.map((tag, idx) => (
        <span key={idx} className="tag-pill">
          {tag}
        </span>
      ))}
    </div>

    <div className="note-footer">
      <button className={`pin-btn ${pinnedNotes.includes(note._id) ? "pinned" : ""}`} onClick={() => togglePin(note._id)}>
    {pinnedNotes.includes(note._id) ? <BsPinFill/> : <BsPin />}
  </button>

      <button
  className="edit-btn"
  onClick={() => handleEdit(note)}
>
  <FiEdit/> Edit
</button>

      <button
  className="delete-btn"
  onClick={() => handleDelete(note._id)}
>
  <FiTrash2/> Delete
</button>
    </div>
  </div>
))}
      </div>

      {sortedNotes.length === 0 && searchQuery && (
        <div className="no-results">
          No results found for "{searchQuery}"
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">

            <button
              className="back-btn"
              onClick={() => setShowModal(false)}
            >
              ← Back to Notes
            </button>

            <div className="type-toggle">
              <button
                className={noteType === "note" ? "active-type" : ""}
                onClick={() => setNoteType("note")}
              >
                Note
              </button>
              <button
                className={noteType === "todo" ? "active-type" : ""}
                onClick={() => setNoteType("todo")}
              >
                To-Do
              </button>
            </div>

            <h2>
              {editingNote ? "Update Note" : "Create New Note"}
            </h2>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Note Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* NOTE CONTENT */}
            {noteType === "note" && (
              <div className="form-group">
                <label>Content</label>
                <textarea
                  rows="6"
                  placeholder="Write your note here..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
            )}

            {/* TODO CONTENT */}
            {noteType === "todo" && (
  <div className="form-group">
    <label>To-Do Items</label>

    {todoItems.map((item, index) => (
      <div key={index} className="todo-item">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => {
            const updated = [...todoItems];
            updated[index] = {
              ...updated[index],
              completed: !updated[index].completed
            };
            setTodoItems(updated);
          }}
        />

        <input
          type="text"
          value={item.text}
          onChange={(e) => {
            const updated = [...todoItems];
            updated[index] = {
              ...updated[index],
              text: e.target.value
            };
            setTodoItems(updated);
          }}
        />
      </div>
    ))}

    <button
      type="button"
      className="add-todo-btn"
      onClick={() =>
        setTodoItems([
          ...todoItems,
          { text: "", completed: false }
        ])
      }
    >
      + Add Item
    </button>
  </div>
)}

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="Comma separated tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button
                className="submit-btn"
                onClick={handleSubmit}
              >
                {editingNote ? "Update Note" : "Create Note"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;