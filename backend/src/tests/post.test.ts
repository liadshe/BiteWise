import request from "supertest";
import initApp from "../index";
import Post from "../models/postModel";
import User from "../models/userModel";
import { Express } from "express";
import { getLoggedInUser, UserData, postsList } from "./testUtils"
import mongoose from "mongoose";

jest.setTimeout(30000);

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
      const response = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + loginUser.token)
        .field("title", post.title)
        .field("description", post.description)
        .field("cuisine", post.cuisine)
        .field("nutrition", JSON.stringify(post.nutrition))
        .attach("image", Buffer.from("dummy image data"), "test.jpg");
    
      post._id = response.body._id; 
      post.owner = loginUser._id; 
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(post.title);
      expect(response.body.description).toBe(post.description);
      expect(response.body.cuisine).toBe(post.cuisine);
      expect(response.body.imgUrl).toMatch(/^uploads[\\/]/);
      expect(response.body.owner).toBe(loginUser._id);
    }
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/post");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get Posts by logged in user", async () => {
    const response = await request(app).get("/post?owner=" + loginUser._id);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
    expect(response.body[0].title).toBe(postsList[0].title);
  });

  test("Get Post by ID", async () => {
    const response = await request(app).get("/post/" + postsList[0]._id);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe(postsList[0].title);
    expect(response.body.description).toBe(postsList[0].description);
    expect(response.body.cuisine).toBe(postsList[0].cuisine);
  });

  test("Update Post", async () => {
    postsList[0].title = "Updated Post Title";
    postsList[0].description = "Updated description for the post";
    
    const response = await request(app)
      .put("/post/" + postsList[0]._id)
      .set("Authorization", "Bearer " + loginUser.token)
      .field("title", postsList[0].title)
      .field("description", postsList[0].description)
      .field("cuisine", postsList[0].cuisine)
      .field("nutrition", JSON.stringify(postsList[0].nutrition));

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(postsList[0].title);
    expect(response.body.description).toBe(postsList[0].description);

    const maliciousResponse = await request(app)
      .put("/post/" + postsList[0]._id)  
      .set("Authorization", "Bearer " + loginUser.token)
      .field("title", "Hack attempt")
      .field("owner", "507f1f77bcf86cd799439044"); 
      
    expect(maliciousResponse.status).toBe(200);
    expect(maliciousResponse.body.owner).not.toBe("507f1f77bcf86cd799439044");
  });

  // Moved Toggle Like up here, BEFORE the post gets deleted!
  test("Toggle Like on a Post", async () => {
    const likeRes = await request(app)
      .post("/post/" + postsList[0]._id + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
      
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.likes).toContain(loginUser._id);

    const unlikeRes = await request(app)
      .post("/post/" + postsList[0]._id + "/like")
      .set("Authorization", "Bearer " + loginUser.token);
      
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.likes).not.toContain(loginUser._id);
  });

  // Delete Post is now the final test in the suite
  test("Delete Post", async () => {
    const response = await request(app).delete("/post/" + postsList[0]._id)
      .set("Authorization", "Bearer " + loginUser.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postsList[0]._id);    
    
    const getResponse = await request(app).get("/post/" + postsList[0]._id);
    expect(getResponse.status).toBe(404);
  });

});