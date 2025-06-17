import API from '@/hooks/api'; // or wherever your file is

const fetchTasks = async () => {
  const res = await API.get('/tasks');
  return res.data;
};
