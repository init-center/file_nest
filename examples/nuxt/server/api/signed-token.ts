import jwt from "jsonwebtoken";

const clientId = "cde85d57-92af-46d9-a609-fe22a36eb978";
const apiKey = "38774487-688f-4a59-a0e1-614f8a08e72e";
export default defineEventHandler(async (event) => {
  const token = jwt.sign(
    {
      clientId,
    },
    apiKey,
    {
      expiresIn: "10m",
    }
  );

  return token;
});
