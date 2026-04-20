import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Share2Icon,
  EyeIcon,
  EyeOff,
  Download,
  ChevronLeft,
  ArrowLeft,
  ChevronRight,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderIcon,
  Sparkles,
} from "lucide-react";

import PersonalInfoForm from "../components/resume/PersonalInfoForm";
import ProfessionalSummaryForm from "../components/resume/ProfessionalSummaryForm";
import ExperienceForm from "../components/resume/ExperienceForm";
import EducationForm from "../components/resume/EducationForm";
import ProjectForm from "../components/resume/ProjectForm";
import SkillsForm from "../components/resume/SkillsForm";
import TemplateSelector from "../components/resume/TemplateSelector";
import ColorPicker from "../components/resume/ColorPicker";

// import { useSelector } from "react-redux";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";
import ResumePreview from "../components/resume/ResumePreview";
import {toPng} from "html-to-image";
import jsPDF from "jspdf";

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  //   const { token } = useSelector((state) => state.auth);

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: "modern",
    accent_color: "#3B82F6",
    public: false,
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "project", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/get/${resumeId}`,
        { withCredentials: true }
      );
      if (data.resume) {
        setResumeData({
          ...data.resume,
          personal_info: data.resume.personal_info || {},
          experience: data.resume.experience || [],
          education: data.resume.education || [],
          projects: data.resume.projects || [],
          skills: data.resume.skills || [],
        });
        document.title = data.resume.title || "Resume Builder";
      }
    } catch {
      toast.error("Failed to load resume");
    }
  };
  useEffect(() => {
    loadExistingResume();
  }, [resumeId]);

  const changeResumeVisibility = async () => {
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append(
        "resumeData",
        JSON.stringify({ public: !resumeData.public }),
      );
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/update/${resumeId}`,
        formData,
        { withCredentials: true }
      );
      setResumeData({ ...resumeData, public: !resumeData.public });
      toast.success(data.message);
    } catch (error) {
      console.error("Error saving resume: ", error)
    }
  };

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume" });
    } else {
      alert("Share not supported on this browser.");
    }
  };

  const downloadResume = async () => {
  const element = document.getElementById("resume-preview");

  try {
    // If image is a File/blob object, convert to base64 first
    let tempImageUrl = null;
    if (resumeData.personal_info?.image && typeof resumeData.personal_info.image === "object") {
      tempImageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(resumeData.personal_info.image);
      });

      // Temporarily update state with base64 so preview re-renders
      setResumeData((prev) => ({
        ...prev,
        personal_info: { ...prev.personal_info, image: tempImageUrl },
      }));

      // Wait for React to re-render with base64 image
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [element.offsetWidth, element.offsetHeight],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, element.offsetWidth, element.offsetHeight);
    pdf.save(`${resumeData.title || "resume"}.pdf`);

    // Restore original File object after download
    if (tempImageUrl) {
      setResumeData((prev) => ({
        ...prev,
        personal_info: { ...prev.personal_info, image: resumeData.personal_info.image },
      }));
    }
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Download failed. Please try again.");
  }
};

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);
      if (typeof resumeData.personal_info.image === "object") {
        delete updatedResumeData.personal_info.image;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));
      removeBackground && formData.append("removeBackground", "true");
      typeof resumeData.personal_info.image === "object" &&
        formData.append("image", resumeData.personal_info.image)

      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/update/${resumeId}`,
        formData,
        { withCredentials: true }
      );
      setResumeData(data.resume)
      toast.success(data.message);
    } catch (error) {
      console.error("Error saving resume: ", error)
    }
  };

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-gray-700 transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-end gap-2">
          {resumeData.public && (
            <button
              onClick={handleShare}
              className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors"
            >
              <Share2Icon className="size-4" /> Share
            </button>
          )}
          <button onClick={changeResumeVisibility} className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors">
            {resumeData.public ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
            {resumeData.public ? "Public" : "Private"}
          </button>

          <button onClick={downloadResume} className="flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors">
            <Download className="size-4" /> Download
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Section - Form */}
          <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000"
                style={{
                  width: `${(activeSectionIndex * 100) / (sections.length - 1)}%`,
                }}
              />

              {/* section navigation  */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
                <div className="flex items-center gap-2">
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template) =>
                      setResumeData((prev) => ({ ...prev, template }))
                    }
                  />
                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) =>
                      setResumeData((prev) => ({
                        ...prev,
                        accent_color: color,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center">
                  {activeSectionIndex !== 0 && (
                    <button
                      onClick={() =>
                        setActiveSectionIndex((prevIndex) =>
                          Math.max(prevIndex - 1, 0),
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                      disabled={activeSectionIndex === 0}
                    >
                      <ChevronLeft className="size-4" /> Previous
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setActiveSectionIndex((prevIndex) =>
                        Math.min(prevIndex + 1, sections.length - 1),
                      )
                    }
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && "opacity-50"
                      }`}
                    disabled={activeSectionIndex === sections.length - 1}
                  >
                    Next <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
              {/* Form Content */}
              <div className="space-y-6">
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) => {
                      setResumeData((prev) => ({
                        ...prev,
                        personal_info: data,
                      }));
                    }}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}
                {activeSection.id === "summary" && (
                  <ProfessionalSummaryForm
                    data={resumeData.professional_summary}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        professional_summary: data,
                      }))
                    }
                    setResumeData={setResumeData}
                  />
                )}
                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        experience: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        education: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "project" && (
                  <ProjectForm
                    data={resumeData.projects}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        projects: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        skills: data,
                      }))
                    }
                  />
                )}
              </div>
              <button onClick={() => { toast.promise(saveResume(), { loading: 'Saving...', success: 'Saved!', error: 'Failed to save' }) }} className="bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm">
                Save Changes
              </button>
            </div>
          </div>

          {/* right Section- preview */}
          <div className="lg:col-span-7 max-lg:mt-6">
            {/* resume preview */}
            <ResumePreview
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
