import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/userModel";
import { getLoggedInUser, UserData, secondUserData } from "./testUtils";
import baseController from "../controllers/baseController";

let app: Express;
let user1: UserData;
let user2: UserData;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany();
  
  // Create User 1 using our utility
  user1 = await getLoggedInUser(app);
  
  // Register User 2 manually so we have two distinct accounts for the 403 test
  const res = await request(app).post("/auth/register").send(secondUserData);
  user2 = { ...secondUserData, _id: res.body._id, token: res.body.token };
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Controller Tests", () => {
  
  describe("GET /user/:id - Get User by ID", () => {
    test("Should get a user by their ID successfully", async () => {
      const response = await request(app).get("/user/" + user1._id);
      
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(user1.username);
      expect(response.body.email).toBe(user1.email);
    });

    test("Should return 404 for a valid format but non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get("/user/" + fakeId);
      
      expect(response.status).toBe(404); 
    });
  });

  describe("PUT /user/:id - Update User Profile", () => {
    
    test("Should block User 2 from updating User 1's profile (403 Forbidden)", async () => {
      const response = await request(app)
        .put("/user/" + user1._id)
        .set("Authorization", "Bearer " + user2.token) // User 2's token
        .send({ username: "hacked_username" });
        
      expect(response.status).toBe(403);
      expect(response.text).toBe("Forbidden: You can only update your own profile");
    });

    test("Should allow User 1 to update their profile WITHOUT an image", async () => {
      const response = await request(app)
        .put("/user/" + user1._id)
        .set("Authorization", "Bearer " + user1.token)
        .send({ username: "updated_username_no_img" });
        
      expect(response.status).toBe(200);
      
      // Fetch the user to verify the change was saved
      const getResponse = await request(app).get("/user/" + user1._id);
      expect(getResponse.body.username).toBe("updated_username_no_img");
    });

    test("Should allow User 1 to update their profile WITH an image via Multer", async () => {
      const response = await request(app)
        .put("/user/" + user1._id)
        .set("Authorization", "Bearer " + user1.token)
        .field("username", "username_with_image")
        // Mimic form-data file upload to trigger the req.file branch in your controller
        .attach("image", Buffer.from("dummy profile picture data"), "profile.jpg");
        
      expect(response.status).toBe(200);
      
      // Fetch the user to verify the image URL was saved and backslashes were replaced
      const getResponse = await request(app).get("/user/" + user1._id);
      expect(getResponse.body.username).toBe("username_with_image");
      expect(getResponse.body.imgUrl).toMatch(/^uploads\//); // Should start with uploads/
    });

    test("Should hit the catch block and return 500 on unexpected errors", async () => {
      // To guarantee we hit the outer catch block in UserController (and not the inner one in baseController),
      // we temporarily spy on and override the parent baseController.update method to force a failure.
      const updateSpy = jest.spyOn(baseController.prototype, 'update').mockImplementationOnce(() => {
          throw new Error("Simulated Server Crash");
      });

      const response = await request(app)
        .put("/user/" + user1._id)
        .set("Authorization", "Bearer " + user1.token)
        .send({ username: "fail_me" });

      expect(response.status).toBe(500);
      expect(response.text).toBe("Error updating user");
      
      // Restore the method so we don't break other tests
      updateSpy.mockRestore();
    });
    
  });
});