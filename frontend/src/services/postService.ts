import axios from 'axios';

const port = 3000;
const API_URL = `http://localhost:${port}/post`; 

export const getPosts = async (page?: number, cuisine?: string, search?: string) => {
    const params: any = {};
    if (page) params.page = page;
    if (cuisine && cuisine !== 'All') params.cuisine = cuisine;
    if (search) params.search = search;

    const response = await axios.get(API_URL, { params });
    return response.data;
}

export const getPostById = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
}

export const toggleLike = async (postId: string) => {
    // get token to authenticate the request
    const token = localStorage.getItem('token');     
    const response = await axios.post(`${API_URL}/${postId}/like`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}