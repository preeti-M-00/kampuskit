import learningAxios from '../../utils/learningAxios';
import { LEARNING_API_PATHS as API_PATHS } from '../../utils/learningApiPaths';

const getAllDocuments = async () => { 
  try {
    const response = await learningAxios.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data;  // Returns { success: true, count: 4, data: [...] }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch documents' };
  }
};

const uploadDocument = async (formData) => {
  try {
    const response = await learningAxios.post(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await learningAxios.delete(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete document' };
  }
};

const getDocumentById = async (id) => {
  try {
    const response = await learningAxios.get(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch document details' };
  }
};

const documentService = {
  getAllDocuments,  
  uploadDocument,
  deleteDocument,
  getDocumentById,
};

export default documentService;