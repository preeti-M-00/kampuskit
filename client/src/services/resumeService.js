import axios from "axios";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/resume`;


// create resume
export const createResume = async (title) => {

  const res = await axios.post(
    `${API}/create`,
    { title },
    { withCredentials: true }
  );

  return res.data.resume;
};


// get resume by id
export const getResume = async (resumeId) => {

  const res = await axios.get(
    `${API}/get/${resumeId}`,
    { withCredentials: true }
  );

  return res.data.resume;
};


// update resume
export const updateResume = async (resumeId, resumeData) => {

  const res = await axios.put(
    `${API}/update`,
    {
      resumeId,
      resumeData
    },
    { withCredentials: true }
  );

  return res.data.resume;
};


// delete resume
export const deleteResume = async (resumeId) => {

  const res = await axios.delete(
    `${API}/delete/${resumeId}`,
    { withCredentials: true }
  );

  return res.data;
};