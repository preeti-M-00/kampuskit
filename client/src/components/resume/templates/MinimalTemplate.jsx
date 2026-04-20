import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import React from "react";

const MinimalTemplate = ({ data = {}, accentColor = "#000000" }) => {
  const personal = data.personal_info || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const cleaned = dateStr.length > 7 ? dateStr.substring(0, 7) : dateStr;
    const [year, month] = cleaned.split("-");
    if (!year || !month) return dateStr;
    return new Date(year, month - 1).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short"
    });
};

  return (
    <div className="p-12 text-gray-800 w-full h-full font-sans">

      {/* HEADER */}
      <header
        className="mb-10 pb-6 border-b"
        style={{ borderColor: accentColor }}
      >
        <h1
          className="text-4xl mb-4 font-semibold"
          style={{ color: accentColor }}
        >
          {personal.full_name || "Your Name"}
        </h1>

        <div className="flex flex-wrap gap-6 text-sm text-gray-700">

          {personal.email && (
            <div className="flex items-center gap-2">
              <Mail size={16} style={{ color: accentColor }} />
              <span>{personal.email}</span>
            </div>
          )}

          {personal.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} style={{ color: accentColor }} />
              <span>{personal.phone}</span>
            </div>
          )}

          {personal.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: accentColor }} />
              <span>{personal.location}</span>
            </div>
          )}

          {personal.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin size={16} style={{ color: accentColor }} />
              <span className="break-all">
                {personal.linkedin}
              </span>
            </div>
          )}

          {personal.website && (
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: accentColor }} />
              <span className="break-all">
                {personal.website}
              </span>
            </div>
          )}

        </div>
      </header>

      {/* PROFESSIONAL SUMMARY */}
      {data.professional_summary && (
        <section className="mb-10">
          <h2
            className="uppercase text-sm mb-4 font-semibold"
            style={{ color: accentColor }}
          >
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {data.professional_summary}
          </p>
        </section>
      )}

      {/* EXPERIENCE */}
      {data.experience?.length > 0 && (
        <section className="mb-10">
          <h2
            className="uppercase text-sm mb-6 font-semibold"
            style={{ color: accentColor }}
          >
            Experience
          </h2>

          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <h3 className="text-lg font-medium">
                    {exp.position}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.start_date)} -{" "}
                    {exp.is_current
                      ? "Present"
                      : formatDate(exp.end_date)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">
                  {exp.company}
                </p>
                {exp.description && (
                  <p className="text-gray-700 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
{data.projects?.length > 0 && (
  <section className="mb-10">
    <h2
      className="uppercase text-sm mb-6 font-semibold"
      style={{ color: accentColor }}
    >
      Projects
    </h2>

    <div className="space-y-6">
      {data.projects.map((proj, index) => (
        <div key={index}>
          <h3 className="text-lg font-medium">{proj.name}</h3>
          {proj.type && (
            <p className="text-gray-600 mb-1">{proj.type}</p>
          )}
          {proj.description && (
            <p className="text-gray-700">{proj.description}</p>
          )}
        </div>
      ))}
    </div>
  </section>
)}

      {/* EDUCATION */}
      {data.education?.length > 0 && (
        <section className="mb-10">
          <h2
            className="uppercase text-sm mb-6 font-semibold"
            style={{ color: accentColor }}
          >
            Education
          </h2>

          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <h3 className="font-medium">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <p className="text-gray-600">
                    {edu.institution}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(edu.graduation_date)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {data.skills?.length > 0 && (
        <section>
          <h2
            className="uppercase text-sm mb-6 font-semibold"
            style={{ color: accentColor }}
          >
            Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded border"
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default MinimalTemplate;