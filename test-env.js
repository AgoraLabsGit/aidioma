require("dotenv").config(); console.log("API Key exists:", !!process.env.OPENAI_API_KEY); console.log("API Key starts with sk-:", process.env.OPENAI_API_KEY?.startsWith("sk-"));
