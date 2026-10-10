// server/tests/integration/auth_and_watchlist.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const User = require("../../src/models/User");
const Watchlist = require("../../src/models/Watchlist");
const scanner = require("../../src/services/scannerService");

let mongoServer;
jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "FinScopeTest", directConnection: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections between tests to keep tests completely independent
  await User.deleteMany({});
  await Watchlist.deleteMany({});
});

describe("Express + MongoDB Integration Tests", () => {
  // Test 1: User Signup Integration
  test("test_user_signup_persists_in_mongodb_and_returns_token", async () => {
    // Checks that signup saves a user to MongoDB with a hashed password and returns a valid JWT,
    // catching database schema mapping or bcrypt hashing failures.

    // Arrange: Valid signup payload
    const signupData = {
      email: "trader1@finscope.io",
      password: "password123",
    };

    // Act: Send POST /user/signup
    const response = await request(app)
      .post("/user/signup")
      .set("X-Forwarded-For", "10.0.1.1")
      .send(signupData);

    // Assert: HTTP response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(signupData.email);

    // Assert: Database persistence
    const savedUser = await User.findOne({ email: signupData.email });
    expect(savedUser).not.toBeNull();
    // Verify password was hashed and not stored in plain-text
    expect(savedUser.password).not.toBe(signupData.password);
    expect(savedUser.password.startsWith("$2")).toBe(true);
  });

  // Test 2: Duplicate Email Rejection
  test("test_user_signup_rejects_duplicate_email", async () => {
    // Checks that attempting to register an existing email returns HTTP 400,
    // catching bugs where duplicate accounts overwrite existing credentials.

    // Arrange: Create user in database first
    await request(app)
      .post("/user/signup")
      .set("X-Forwarded-For", "10.0.1.2")
      .send({ email: "trader2@finscope.io", password: "password123" });

    // Act: Attempt signup with identical email
    const duplicateResponse = await request(app)
      .post("/user/signup")
      .set("X-Forwarded-For", "10.0.1.2")
      .send({ email: "trader2@finscope.io", password: "differentpassword" });

    // Assert
    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body.message).toBe("User Already Exists");
  });

  // Test 3: User Login Verification
  test("test_user_login_verifies_password_and_rejects_invalid_credentials", async () => {
    // Checks that login succeeds for valid credentials and rejects incorrect passwords with 400,
    // catching authentication bypasses or false rejection regressions.

    // Arrange: Register a user
    const credentials = { email: "trader3@finscope.io", password: "validPassword456" };
    await request(app)
      .post("/user/signup")
      .set("X-Forwarded-For", "10.0.1.3")
      .send(credentials);

    // Act A: Login with correct password
    const successLogin = await request(app)
      .post("/user/login")
      .set("X-Forwarded-For", "10.0.1.3")
      .send(credentials);

    // Act B: Login with wrong password
    const failedLogin = await request(app)
      .post("/user/login")
      .set("X-Forwarded-For", "10.0.1.3")
      .send({ email: credentials.email, password: "wrongPassword" });

    // Assert
    expect(successLogin.status).toBe(200);
    expect(successLogin.body.success).toBe(true);
    expect(successLogin.body.token).toBeDefined();

    expect(failedLogin.status).toBe(400);
    expect(failedLogin.body.message).toBe("Invalid Email or Password");
  });

  // Test 4: Watchlist Route Authentication and Database Persistence
  test("test_watchlist_requires_auth_and_persists_item_in_mongodb", async () => {
    // Checks that watchlist endpoints block unauthenticated requests with 401 and persist items to MongoDB when logged in,
    // catching authorization leaks and MongoDB relationship mapping issues.

    // Arrange: Register user to obtain auth token
    const userRes = await request(app)
      .post("/user/signup")
      .set("X-Forwarded-For", "10.0.1.4")
      .send({ email: "trader4@finscope.io", password: "password123" });
    const authToken = userRes.body.token;

    // Mock only the external network call to the Python price scanner
    const priceSpy = jest.spyOn(scanner, "fetchCurrPrice").mockResolvedValue({ price: 1850.5 });

    // Act A: Unauthenticated request should be rejected with 401
    const unauthResponse = await request(app)
      .get("/watchlist/all")
      .set("X-Forwarded-For", "10.0.1.4");
    expect(unauthResponse.status).toBe(401);

    // Act B: Authenticated request to add item to watchlist
    const addResponse = await request(app)
      .post("/watchlist/add")
      .set("Authorization", `Bearer ${authToken}`)
      .set("X-Forwarded-For", "10.0.1.4")
      .send({ symbol: "INFY" });

    // Assert: HTTP Response
    expect(addResponse.status).toBe(200);
    expect(addResponse.body.success).toBe(true);
    expect(addResponse.body.data.symbol).toBe("INFY");

    // Assert: Verify persisted in MongoDB
    const itemInDb = await Watchlist.findOne({ symbol: "INFY" });
    expect(itemInDb).not.toBeNull();
    expect(itemInDb.priceAddInWatchlist).toBe(1850.5);

    // Clean up spy
    priceSpy.mockRestore();
  });
});
