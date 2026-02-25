import axios from 'axios';

// תחליפי את הפורט (3000) ואת הנתיב במידה וה-API שלך מוגדר אחרת
const API_URL = 'http://localhost:3000/post'; 

export const getPosts = async (page: number, cuisine: string, search: string) => {
    // שליחת בקשת GET לשרת עם פרמטרים
    const response = await axios.get(API_URL, {
        params: { page, cuisine, search }
    });
    return response.data;
}