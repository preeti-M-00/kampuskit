import learningAxios from '../../utils/learningAxios';
import { LEARNING_API_PATHS as API_PATHS } from '../../utils/learningApiPaths';

const getDashboardData = async () => {
  try {
    const response = await learningAxios.get(API_PATHS.PROGRESS.GET_DASHBOARD);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch dashboard data' };
  }
};

const progressService = {
  getDashboardData,
};

export default progressService;