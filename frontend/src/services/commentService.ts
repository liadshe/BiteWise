import axios from 'axios';

const port = 3000;
const API_URL = `http://localhost:${port}/comment`; 

export const getCommentsByPostId = async (postId: string) => {
    const response = await axios.get(API_URL, { params: { postId } });
    return response.data;
}

export const addComment = async (postId: string, content: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(API_URL, 
        { postId, content }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
}

// Add these two new functions:
export const updateComment = async (commentId: string, content: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}/${commentId}`, 
        { content }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
}

export const deleteComment = async (commentId: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.delete(`${API_URL}/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
}