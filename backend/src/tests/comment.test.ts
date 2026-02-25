import request from "supertest";
import initApp from "../index";
import Comment from "../models/commentModel";
import User from "../models/userModel";
import Post from "../models/postModel";
import { Express } from "express";
import { createUser1WithPostandUser2, commentsList, UserData } from "./testUtils";
import mongoose from "mongoose";

let app: Express;
let users: UserData[]; // user 1 with post and user 2 without post

jest.setTimeout(30000); // Set timeout to 30 seconds for all tests in this suite
beforeAll(async () => {
  app = await initApp();
  await Comment.deleteMany();
  await Post.deleteMany();
  await User.deleteMany();
  users = await createUser1WithPostandUser2(app);
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Comment Tests Suite", () => {
    test("Initial empty comments", async () => {
        const response = await request(app).get("/comment");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }); 

    test("Create Comment", async () => {

      // get post id from user 1s post
      const postResponse = await request(app).get("/post?owner=" + users[0]._id);
      expect(postResponse.status).toBe(200);
      expect(postResponse.body.length).toBe(1);
      const postId = postResponse.body[0]._id;
    
      // create comment for user 1s post from user 2
      let commentData = { ...commentsList[0], postId };
      const response = await request(app).post("/comment")
        .set("Authorization", "Bearer " + users[1].token)
        .send(commentData); 
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(commentData.content);
      expect(response.body.owner).toBe(users[1]._id);
      expect(response.body.postId).toBe(postId);

      // create comment for user 1s post from user 1
      commentData = { ...commentsList[1], postId};
      const response2 = await request(app).post("/comment")
        .set("Authorization", "Bearer " + users[0].token)
        .send(commentData); 
      expect(response2.status).toBe(201);
      expect(response2.body.content).toBe(commentData.content);
      expect(response2.body.owner).toBe(users[0]._id);
      expect(response2.body.postId).toBe(postId);
    });

      test("Get All Comments", async () => {
        const response = await request(app).get("/comment");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
      });

      test("Get Comments by postId", async () => {
        // get post id from user 1s post
        const postResponse = await request(app).get("/post?owner=" + users[0]._id);
        expect(postResponse.status).toBe(200);
        expect(postResponse.body.length).toBe(1);
        const postId = postResponse.body[0]._id;

        const response = await request(app).get("/comment?postId=" + postId);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);

      });

      test("Get Comment by ID", async () => {
        // get comment id from user 2s comment
        const commentsResponse = await request(app).get("/comment?owner=" + users[1]._id);
        expect(commentsResponse.status).toBe(200);
        expect(commentsResponse.body.length).toBe(1);
        const commentId = commentsResponse.body[0]._id; 
        const response = await request(app).get("/comment/" + commentId); 
        expect(response.status).toBe(200);
        expect(response.body.content).toBe(commentsList[0].content);
        expect(response.body.owner).toBe(users[1]._id);
      });

      test("Update Comment", async () => {
        // get comment id from user 2s comment
        const commentsResponse = await request(app).get("/comment?owner=" + users[1]._id);
        expect(commentsResponse.status).toBe(200);
        expect(commentsResponse.body.length).toBe(1);
        const commentId = commentsResponse.body[0]._id; 

        // try to update from user 1 - should fail
        let response = await request(app).put("/comment/" + commentId)
          .set("Authorization", "Bearer " + users[0].token)
          .send({ content: "Updated Comment Content" });
        expect(response.status).toBe(403);

        // try to update owner's field - should fail
        response = await request(app).put("/comment/" + commentId)
          .set("Authorization", "Bearer " + users[1].token)
          .send({ owner: users[0]._id });
        expect(response.status).toBe(400);
        
        // try to update from user 2 - should succeed
        response = await request(app).put("/comment/" + commentId)
          .set("Authorization", "Bearer " + users[1].token)
          .send({ content: "Updated Comment Content" });
        expect(response.status).toBe(200);
        expect(response.body.content).toBe("Updated Comment Content");
      });

      test("Delete Comment", async () => {
        // get comment id from user 2s comment
        const commentsResponse = await request(app).get("/comment?owner=" + users[1]._id);
        expect(commentsResponse.status).toBe(200);
        expect(commentsResponse.body.length).toBe(1);
        const commentId = commentsResponse.body[0]._id;
        
        // try to delete from user 1 - should fail
        let response = await request(app).delete("/comment/" + commentId)
          .set("Authorization", "Bearer " + users[0].token);
        expect(response.status).toBe(403);

        // try to delete from user 2 - should succeed
        response = await request(app).delete("/comment/" + commentId)
          .set("Authorization", "Bearer " + users[1].token);
        expect(response.status).toBe(200);
      });

    });