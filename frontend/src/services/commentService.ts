import axios from 'axios';

const port = 3000;
const API_URL = `http://localhost:${port}/comment`; 

export const getCommentsByPostId = async (postId: string) => {
    const response = await axios.get(API_URL, { params: { postId } });
    return response.data;
}

export const addComment = async (postId: string, content: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, 
        { postId, content }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
}