import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import User from "../models/userModel";
import { userData, postsList } from "./testUtils";
import mongoose from "mongoose"; // Imported mongoose to close connections

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockRejectedValue(new Error("Mocked Invalid Google Token")),
      };
    }),
  };
});

let app: Express;

beforeAll(async () => {
  process.env.TOKEN_EXPIRATION = "1"; // Token expires in 1 second
  app = await initApp();
  await User.deleteMany();
});

afterAll(async () => {
  // Close the mongoose connection to resolve open handle warnings
  await mongoose.connection.close(); 
});

describe("Test Auth Suite", () => {

  test("Test post a post without token fails", async () => {
    const postDataItem = postsList[0];
    const response = await request(app)
      .post("/post")
      // Send as form-data even though it fails early, just for consistency
      .field("title", postDataItem.title)
      .field("description", postDataItem.description)
      .field("cuisine", postDataItem.cuisine)
      .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
      .attach("image", Buffer.from("dummy image data"), "test.jpg");
      
    expect(response.status).toBe(401);
  });

  test("Test Registration", async () => {
    const email = userData.email;
    const password = userData.password;
    const username = userData.username;
    
    // Auth routes use JSON, so .send() is fine here
    const response = await request(app).post("/auth/register").send(
      { "email": email, "password": password, "username": username }
    );
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    userData.token = response.body.token;
    userData._id = response.body._id;

    //check refresh token
    expect(response.body).toHaveProperty("refreshToken");
    userData.refreshToken = response.body.refreshToken;
  });

 test("create a post with token succeeds", async () => {
    // Grab a fresh token in case the previous one took >1s and expired
    const loginRes = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password
    });
    const freshToken = loginRes.body.token;

    const postDataItem = postsList[0];
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + freshToken)
      .field("title", postDataItem.title)
      .field("description", postDataItem.description)
      .field("cuisine", postDataItem.cuisine)
      .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
      .attach("image", Buffer.from("dummy image data"), "test.jpg");
      
    expect(response.status).toBe(201);
  });

  test("create a post with comporomised token fails", async () => {
    const postDataItem = postsList[0];
    const compromizedToken = userData.token + "a";
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + compromizedToken)
      .field("title", postDataItem.title)
      .field("description", postDataItem.description)
      .field("cuisine", postDataItem.cuisine)
      .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
      .attach("image", Buffer.from("dummy image data"), "test.jpg");
      
    expect(response.status).toBe(401);
  });

  test("Test Login", async () => {
    const email = userData.email;
    const password = userData.password;
    const response = await request(app).post("/auth/login").send(
      { "email": email, "password": password }
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  jest.setTimeout(10000);

  test("Test using token after expiration fails", async () => {
    
    //sleep for 5 seconds to let the token expire
    await new Promise((r) => setTimeout(r, 5000));

    const postDataItem = postsList[0];
    const response = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .field("title", postDataItem.title)
      .field("description", postDataItem.description)
      .field("cuisine", postDataItem.cuisine)
      .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
      .attach("image", Buffer.from("dummy image data"), "test.jpg");
      
    expect(response.status).toBe(401);

    //refresh the token
    const refreshResponse = await request(app).post("/auth/refresh").send(
      { "refreshToken": userData.refreshToken }
    );
    console.log("Refresh response body:", refreshResponse.body);
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty("token");
    userData.token = refreshResponse.body.token;
    userData.refreshToken = refreshResponse.body.refreshToken;

    //try to create post again with new token
    const retryResponse = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      // FIX: Use form-data fields for the retry as well
      .field("title", postDataItem.title)
      .field("description", postDataItem.description)
      .field("cuisine", postDataItem.cuisine)
      .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
      .attach("image", Buffer.from("dummy image data"), "test.jpg");
      
    expect(retryResponse.status).toBe(201);
  });

  //test double use of refresh token fails
  test("Test double use of refresh token fails", async () => {
    //use the current refresh token to get a new token
    const refreshResponse1 = await request(app).post("/auth/refresh").send(
      { "refreshToken": userData.refreshToken }
    );
    expect(refreshResponse1.status).toBe(200);
    expect(refreshResponse1.body).toHaveProperty("token");
    const newRefreshToken = refreshResponse1.body.refreshToken;

    //try to use the same refresh token again
    const refreshResponse2 = await request(app).post("/auth/refresh").send(
      { "refreshToken": userData.refreshToken }
    );
    expect(refreshResponse2.status).toBe(401);

    //try to use the new refresh token also fails
    const refreshResponse3 = await request(app).post("/auth/refresh").send(
      { "refreshToken": newRefreshToken }
    );
    expect(refreshResponse3.status).toBe(401);
  });

  test("Login with wrong password should fail", async () => {
    const response = await request(app).post("/auth/login").send(
      { "email": userData.email, "password": "wrong_password_123" }
    );
    // Depending on your controller, this might be 400 or 401
    expect(response.status).not.toBe(200); 
  });

  test("Login with non-existent email should fail", async () => {
    const response = await request(app).post("/auth/login").send(
      { "email": "nobody@nowhere.com", "password": "password" }
    );
    expect(response.status).not.toBe(200);
  });

  test("Register with missing fields should fail", async () => {
    const response = await request(app).post("/auth/register").send(
      { "email": "onlyemail@test.com" } // Missing password and username
    );
    expect(response.status).not.toBe(201);
  });

  test("Google Login with invalid token should fail gracefully", async () => {
    const response = await request(app).post("/auth/google").send(
      { credential: "fake_google_token" }
    );
    // It should fail to verify with Google and catch the error
    expect(response.status).toBe(400); // Or 500 depending on your catch block
  });

  test("Auth endpoints catch 500 errors", async () => {
    // Force the DB to crash to test the catch(err) block in login
    const spy = jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error("DB Crash"));
    
    const response = await request(app).post("/auth/login").send(
      { "email": userData.email, "password": userData.password }
    );
    
    expect(response.status).toBe(500);
    spy.mockRestore();
  });
});