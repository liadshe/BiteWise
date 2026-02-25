import request from "supertest";
import initApp from "../index";
import Post from "../models/postModel";
import User from "../models/userModel";
import { Express } from "express";
import { getLoggedInUser, UserData, postsList } from "./testUtils"
import mongoose from "mongoose";

jest.setTimeout(30000); // Set timeout to 30 seconds for all tests in this suite

let app: Express;
let loginUser: UserData;


beforeAll(async () => {
  app = await initApp();
  await Post.deleteMany();
  await User.deleteMany();
  loginUser = await getLoggedInUser(app);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Post Tests Suite", () => {
  
    test("Initial empty posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create Post", async () => {
    for (const post of postsList) {
      const response = await request(app).post("/post")
        .set("Authorization", "Bearer " + loginUser.token)
        .send(post);
    
      post._id = response.body._id; // Store the created post ID for later tests
      post.owner = loginUser._id; // Store the owner ID for later tests
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(post.content);
      expect(response.body.owner).toBe(loginUser._id);
      expect(response.body.imgUrl).toBe(post.imgUrl);
      expect(response.body.likes).toEqual(post.likes);
      expect(response.body.nutrition).toEqual(post.nutrition);
    }
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get Posts by logged in user", async () => {
    const response = await request(app).get(
      "/post?owner=" + loginUser._id
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
    expect(response.body[0].content).toBe(postsList[0].content);
  });

  // get post by id
  test("Get Post by ID", async () => {
    const response = await request(app).get("/post/" + postsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body.owner).toBe(postsList[0].owner);
    expect(response.body.imgUrl).toBe(postsList[0].imgUrl);
    expect(response.body.likes).toEqual(postsList[0].likes);
    expect(response.body.nutrition).toEqual(postsList[0].nutrition);
  });

  // update post
  test("Update Post", async () => {
    postsList[0].content = "Updated Post Content";
    const response = await request(app)
      .put("/post/" + postsList[0]._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(postsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(postsList[0].content);

    // Verify that the owner cannot be changed
    postsList[0].owner = "507f1f77bcf86cd799439044";
    const response2 = await request(app)
      .put("/post/" + postsList[0]._id)  
        .set("Authorization", "Bearer " + loginUser.token)
        .send(postsList[0]);
    expect(response2.status).toBe(400);
    
  });


  test("Delete Post", async () => {
    const response = await request(app).delete("/post/" + postsList[0]._id)
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body._id).toBe(postsList[0]._id);    
    const getResponse = await request(app).get("/post/" + postsList[0]._id);
    expect(getResponse.status).toBe(404);
  });
  });