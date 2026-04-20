import React, { useEffect, useState } from "react";
import {
  FilePenLine,
  LoaderCircle,
  Pencil,
  Plus,
  Trash,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { dummyResumeData } from "../assets/assets";
// import { useSelector } from "react-redux";
import api from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";
import pdfToText from "react-pdftotext";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Dashboard = () => {
  const { userData } = useContext(AppContext);

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const loadAllResumes = async () => {

  try {

    const { data } = await api.get(
      "/resumes/my-resumes",
      { withCredentials: true }
    );

    setAllResumes(data.resumes || []);

  } catch (error) {

    console.error(error);
    setAllResumes([]);

  }

};

  const createResume = async (event) => {
    try {
      event.preventDefault();
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/create`,
        { title },
        { withCredentials: true },
      );
      setAllResumes([...allResumes, data.resume]);
      setTitle("");
      setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/upload-resume`,
        { title, resumeText },
        { withCredentials: true },
      );
      setTitle("");
      setResume(null);
      setShowUploadResume(false);
      navigate(`/app/builder/${data.resumeId}`, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const editTitle = async (event) => {
    try {
      event.preventDefault();
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/update/${editResumeId}`,
        { resumeId: editResumeId, resumeData: { title },
        },
        { withCredentials: true },);
      setAllResumes(
        allResumes.map((resume) =>
          resume._id === editResumeId ? { ...resume, title } : resume));
      setTitle("");
      setEditResumeId("");
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this resume?",
      );
      if (confirm) {
        const { data } = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/delete/${resumeId}`, {
          withCredentials: true,
        });
        setAllResumes(allResumes.filter((resume) => resume._id !== resumeId));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    loadAllResumes();
  }, []);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
  <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '32px 16px' }}>
        <p className="text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden">
          Welcome, {userData?.name || 'User'}
        </p>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex gap-4">
          {/* Create */}
          <button
            onClick={() => setShowCreateResume(true)}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <Plus className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-full text-white" />
            <p className="text-sm group-hover:text-indigo-600 transition-all duration-300">
              Create Resume
            </p>
          </button>

          {/* Upload */}
          <button
            onClick={() => setShowUploadResume(true)}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center border border-slate-300 rounded-lg group hover:border-purple-500 hover:shadow-lg transition-all duration-300"
          >
            <UploadCloud className="size-11 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full text-white transition-all duration-300" />
            <p className="text-sm mt-3 group-hover:text-purple-600 transition-all duration-300">
              Upload Existing
            </p>
          </button>
        </div>

        <hr style={{ borderColor: '#cbd5e1', margin: '24px 0', width: '305px' }} />

        {/* ================= RESUME CARDS ================= */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
          {allResumes?.map((resume, index) => {
            const baseColor = colors[index % colors.length];

            return (
              <button
                key={index}
                onClick={() => navigate(`/app/builder/${resume._id}`, { replace:true })}
                className="relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                  borderColor: baseColor + "40",
                }}
              >
                <FilePenLine
                  className="size-7 group-hover:scale-105 transition-all"
                  style={{ color: baseColor }}
                />

                <p
                  className="text-sm group-hover:scale-105 transition-all px-2 text-center"
                  style={{ color: baseColor }}
                >
                  {resume.title}
                </p>

                <p
                  className="absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                  style={{ color: baseColor + "90" }}
                >
                  Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1 right-1 group-hover:flex items-center hidden "
                >
                  <Trash
                    onClick={() => deleteResume(resume._id)}
                    className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                  />
                  <Pencil
                    onClick={() => {
                      setEditResumeId(resume._id);
                      setTitle(resume.title);
                    }}
                    className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* ================= CREATE MODAL ================= */}
        {/* {showCreateResume && (
          <form
            onSubmit={createResume}
            onClick={() => setShowCreateResume(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4 ">Create a Resume</h2>
              <input
                type="text"
                placeholder="Enter resume title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 mb-4 focus:border-green-500 ring-green-600 "
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Create Resume
              </button>
              <X
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowCreateResume(false);
                  setTitle("");
                }}
              />
            </div>
          </form>
        )} */}

        {/* ================= UPLOAD MODAL ================= */}
        {/* ================= CREATE MODAL ================= */}
{showCreateResume && (
  <form
    onSubmit={createResume}
    onClick={() => setShowCreateResume(false)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '24px' }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px',color:'#0f172a'}}>Create a Resume</h2>
      <input
        type="text"
        placeholder="Enter resume title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '10px 16px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px', color:'#0f172a', backgroundColor:'white' }}
        required
      />
      <button
        type="submit"
        style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
      >
        Create Resume
      </button>
      <X
        style={{ position: 'absolute', top: '16px', right: '16px', color: '#94a3b8', cursor: 'pointer' }}
        onClick={() => { setShowCreateResume(false); setTitle(""); }}
      />
    </div>
  </form>
)}

{/* ================= UPLOAD MODAL ================= */}
{showUploadResume && (
  <form
    onSubmit={uploadResume}
    onClick={() => setShowUploadResume(false)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '24px' }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px',color:'#0f172a'}}>Upload Resume</h2>
      <input
        type="text"
        placeholder="Enter resume title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '10px 16px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px',color:'#0f172a', backgroundColor:'white' }}
        required
      />
      <div>
        <label htmlFor="resume-input" style={{ display: 'block', fontSize: '14px', color: '#334155' }}>
          Select Resume File
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '2px dashed #94a3b8', borderRadius: '8px', padding: '40px 16px', margin: '16px 0', cursor: 'pointer', color: '#94a3b8' }}>
            {resume ? (
              <p style={{ color: '#16a34a' }}>{resume.name}</p>
            ) : (
              <>
                <UploadCloud style={{ width: '56px', height: '56px', strokeWidth: 1 }} />
                <p>Upload resume</p>
              </>
            )}
          </div>
        </label>
        <input type="file" id="resume-input" accept=".pdf" hidden onChange={(e) => setResume(e.target.files[0])} required />
      </div>
      <button
        disabled={isLoading}
        style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        {isLoading && <LoaderCircle style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
        {isLoading ? "Uploading..." : "Upload resume"}
      </button>
      <X
        style={{ position: 'absolute', top: '16px', right: '16px', color: '#94a3b8', cursor: 'pointer' }}
        onClick={() => { setShowUploadResume(false); setTitle(""); setResume(null); }}
      />
    </div>
  </form>
)}

{/* ================= EDIT TITLE MODAL ================= */}
{editResumeId && (
  <form
    onSubmit={editTitle}
    onClick={() => setEditResumeId("")}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '24px' }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px',color:'#0f172a' }}>Edit Resume Title</h2>
      <input
        type="text"
        placeholder="Enter resume title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '10px 16px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px',color:'#0f172a', backgroundColor:'white' }}
        required
      />
      <button
        type="submit"
        style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
      >
        Update
      </button>
      <X
        style={{ position: 'absolute', top: '16px', right: '16px', color: '#94a3b8', cursor: 'pointer' }}
        onClick={() => { setEditResumeId(""); setTitle(""); }}
      />
    </div>
  </form>
)}
      </div>
    </div>
  );
};

export default Dashboard;
