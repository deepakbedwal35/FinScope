// server/tests/unit/auth.test.js
const { generateAccessToken, verifyAccessToken } = require("../../src/services/auth");
const { registerSchema, loginSchema } = require("../../src/validators/authValidator");

describe("Auth Services and Validators", () => {
  // Test 1: Token signing and roundtrip decode
  test("test_generate_and_verify_access_token_success", () => {
    // Checks that a valid user payload is signed and correctly decoded with matching fields,
    // catching bugs where JWT secrets or payload fields are mismatched.

    // Arrange
    const userPayload = { _id: "usr_12345", email: "trader@finscope.io" };

    // Act: Generate token and verify it
    const token = generateAccessToken(userPayload);
    const decoded = verifyAccessToken(token);

    // Assert
    expect(typeof token).toBe("string");
    expect(decoded).not.toBeNull();
    expect(decoded._id).toBe(userPayload._id);
    expect(decoded.email).toBe(userPayload.email);
  });

  // Test 2: Token with "Bearer " prefix handling
  test("test_verify_access_token_strips_bearer_prefix", () => {
    // Checks that verifyAccessToken handles tokens containing the 'Bearer ' prefix,
    // catching bugs where raw HTTP Authorization headers fail JWT decoding.

    // Arrange
    const userPayload = { _id: "usr_67890", email: "investor@finscope.io" };
    const rawToken = generateAccessToken(userPayload);
    const bearerHeader = `Bearer ${rawToken}`;

    // Act
    const decoded = verifyAccessToken(bearerHeader);

    // Assert
    expect(decoded).not.toBeNull();
    expect(decoded.email).toBe(userPayload.email);
  });

  // Test 3: Tampered or invalid token returns null
  test("test_verify_tampered_token_returns_null_without_crashing", () => {
    // Checks that an altered or invalid JWT signature returns null instead of throwing an unhandled exception,
    // catching bugs where malicious or malformed tokens crash the server.

    // Arrange
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature";

    // Act
    const decoded = verifyAccessToken(invalidToken);

    // Assert
    expect(decoded).toBeNull();
  });

  // Test 4: Registration validator accepts valid input
  test("test_register_schema_accepts_valid_email_and_password", () => {
    // Checks that valid registration credentials satisfy schema requirements,
    // catching regressions in Joi registration rules.

    // Arrange
    const validData = { email: "student@finscope.in", password: "securepassword123" };

    // Act
    const { error } = registerSchema.validate(validData);

    // Assert
    expect(error).toBeUndefined();
  });

  // Test 5: Registration validator rejects short password
  test("test_register_schema_rejects_passwords_shorter_than_5_chars", () => {
    // Checks that registration enforces minimum password length (5 characters),
    // catching security regressions where weak passwords are inadvertently accepted.

    // Arrange
    const weakData = { email: "student@finscope.in", password: "123" };

    // Act
    const { error } = registerSchema.validate(weakData);

    // Assert
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("length must be at least 5 characters long");
  });
});

