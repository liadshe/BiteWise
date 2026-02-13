import request from "supertest";
import { Express } from "express";

export type UserData = {
    _id?: string,
    email: string,
    password: string,
    username: string,
    token: string,
    refreshToken: string
};

export const userData: UserData = {
    email: "test@test.com",
    password: "testpass",
    username: "testuser",
    token: "",
    refreshToken: ""
};

export const secondUserData: UserData = 
    {
        email: "test2@test.com",
        password: "testpass2",
        username: "testuser2",
        token: "",
        refreshToken: ""
    };

export const getLoggedInUser = async (app: Express): Promise<UserData> => {
    const { email, password, username } = userData;
    
    // try Register
    let response = await request(app).post("/auth/register").send({ email, password, username });
    
    // if registration failed ,try Login
    if (response.status !== 201) {
        response = await request(app).post("/auth/login").send({ email, password });
    }

    if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Failed to authenticate test user: ${response.text}`);
    }

    return {
        _id: response.body._id, 
        token: response.body.token,
        refreshToken: response.body.refreshToken,
        email,
        password,
        username
    };
}


export type PostData = { 
    _id?: string,
    content: string,
    imgUrl: string,
    owner?: string,
    likes: string[],
    nutrition?: { calories: number, protein: number, suggestions: string } };

export const postsList: PostData[] = [
    {
        content: "This is the content of test post 1",
        imgUrl: "public/images/recipe1.jpg",
        likes: [],
        nutrition: { calories: 100, protein: 20, suggestions: "Add more vegetables" }
    },
    {
        content: "This is the content of test post 2",
        imgUrl: "public/images/recipe2.jpg",
        likes: [],
        nutrition: { calories: 150, protein: 30, suggestions: "Add more protein" }
    }
];

// returns an array with two users, the first one has a post and the second one is just a regular user
export const createUser1WithPostandUser2 = async (app: Express): Promise<UserData[]> => {
    // Create a user
    const users: UserData[] = [];
    const data = await getLoggedInUser(app);
    users[0] = data;

    // Create a post for the user
    const postResponse = await request(app).post("/post").send(postsList[0]).set("Authorization", "Bearer " + (await data).token);
    if (postResponse.status !== 201) {
        throw new Error(`Failed to create post for test user: ${postResponse.text}`);
    } 

    // register second user
    const secondUserResponse = await request(app).post("/auth/register").send(secondUserData);
    if (secondUserResponse.status !== 201) {
        throw new Error(`Failed to register second test user: ${secondUserResponse.text}`);
    }
    users[1] = secondUserResponse.body;

    return users;
}

export type CommentData = { 
    _id?: string,
    content: string,
    owner?: string,
    postId?: string };

export const commentsList: CommentData[] = [
  { content: "this is my comment", postId: "507f1f77bcf86cd799439012" },
  { content: "this is my second comment",postId: "507f1f77bcf86cd799439014" },
  { content: "this is my third comment", postId: "507f1f77bcf86cd799439016" },
  { content: "this is my fourth comment", postId: "507f1f77bcf86cd799439018" },
];