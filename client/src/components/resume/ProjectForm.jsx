import { Plus, Trash2 } from 'lucide-react';
import React from 'react'

const ProjectForm = ({ data, onChange }) => {
    const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: ""
    };
    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };
  const updateProject = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  return (
    <div >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            Projects
          </h3>
          <p className="text-sm text-gray-500">Add your Project </p>
        </div>
        <button
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors "
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

        <div className="space-y-4 mt-6">
          {data.map((project, index) => (
            <div
              key={index}
              className="p-5 border border-gray-300 rounded-xl bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h4 className='text-lg font-semibold text-gray-900'>Project #{index + 1}</h4>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="grid gap-3">
                <input
                  value={project.name || ""}
                  onChange={(e) =>
                    updateProject(index, "name", e.target.value)
                  }
                  type="text"
                  placeholder="Project Name"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 
bg-white text-gray-900 placeholder-gray-500
focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  // style={{ border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', padding: '8px 12px' }}
                />
                <input
                  value={project.type || ""}
                  onChange={(e) =>
                    updateProject(index, "type", e.target.value)
                  }
                  type="text"
                  placeholder="Project Type"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 
bg-white text-gray-900 placeholder-gray-500
focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  // style={{ border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', padding: '8px 12px' }}
                />
                <textarea rows={4}
                  value={project.description || ""}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                  placeholder="Describe your project..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 
bg-white text-gray-900 placeholder-gray-500
focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  // style={{ border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', padding: '8px 12px' }}
                />
             
              </div>
            </div>
          ))}
        </div>
      
    </div>
  )
}

export default ProjectForm