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