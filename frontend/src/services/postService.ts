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

export const createPost = async (postData: FormData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}`, { 
        method: 'POST',
        headers: {
            // DO NOT set 'Content-Type' here. The browser handles it for FormData.
            'Authorization': `Bearer ${token}`
        },
        body: postData,
    });

    if (!response.ok) {
        throw new Error('Failed to create recipe');
    }

    return await response.json();
};

export const analyzeRecipe = async (recipeData: any) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recipeData)
    });

    if (!response.ok) throw new Error('Failed to analyze recipe');
    return await response.json();
};