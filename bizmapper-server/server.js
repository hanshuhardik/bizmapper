require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a senior technical architect and business consultant. 
Analyze the business description carefully and respond ONLY with 
valid JSON — no markdown, no backticks, no explanation.

Detect business size from keywords:
- "small/shop/clinic/one person/solo" = small
- "team/growing/multiple staff/branch" = medium  
- "enterprise/large/scale/hospital/chain" = large

Adapt ALL recommendations based on detected business size:
- small → free/cheap tools, simple stack, minimal infrastructure
- medium → balance cost and features, scalable options
- large → enterprise tools, proper architecture, team-ready stack

Use this exact JSON format:
{
  "businessSize": "small|medium|large",
  
  "summary": "2-3 sentences. Explicitly mention business size and 
  why that drives your recommendations.",

  "assumptions": [
    "Specific assumption made due to vague or missing input"
  ],

  "clarifyingQuestions": [
    "Specific question that would change the recommendation"
  ],

  "processes": [
    {
      "name": "Process name",
      "description": "What this process does",
      "priority": "high|medium|low",
      "workflow": "Specific trigger → Specific action → Specific outcome",
      "scaleNote": "How this process changes if business grows"
    }
  ],

  "recommendedTools": [
    {
      "tool": "Tool name",
      "category": "Category",
      "reason": "Why this specific tool for THIS business size and type",
      "monthlyCostINR": number,
      "freeAlternative": "Free/open-source alternative or null",
      "tradeoff": "What you give up by choosing this tool"
    }
  ],

  "techStack": {
    "frontend": "React.js with role-based routing (not plain HTML - even small businesses need dynamic UI)",
    "backend": "Node.js with Express - REST API covering [list specific modules like appointments/billing/auth]",
    "database": "Choose based on data: PostgreSQL for relational, MongoDB for flexible, Firebase for real-time",
    "authentication": "JWT tokens / Firebase Auth / session-based (pick based on scale)",
    "hosting": "Choose based on budget: Vercel+Render (free tier) / Railway / AWS",
    "reasoning": "Explain why this exact stack fits THIS business size and domain specifically"
  },

  "solutionOptions": [
    {
      "optionName": "Option A: Quick & Affordable",
      "approach": "Use existing SaaS tools (e.g. Zoho + Twilio)",
      "pros": "Fast to set up, low upfront cost",
      "cons": "Less control, recurring fees, vendor lock-in",
      "totalMonthlyINR": number,
      "bestFor": "Who this option suits"
    },
    {
      "optionName": "Option B: Custom Built",
      "approach": "Build from scratch using the developer stack",
      "pros": "Full control, no recurring tool fees, scalable",
      "cons": "Higher upfront cost, needs developer",
      "totalMonthlyINR": number,
      "bestFor": "Who this option suits"
    }
  ],

  "budgetBreakdown": {
    "items": [
      { 
        "name": "Tool or service name", 
        "monthlyINR": number, 
        "yearlyINR": number,
        "note": "What this cost covers specifically"
      }
    ],
    "totalMonthlyINR": number,
    "totalYearlyINR": number,
    "budgetTier": "bootstrap|growth|scale",
    "reasoning": "Explain what drives cost and what assumptions affect this number"
  },

  "architectureFlow": [
    "Step 1: Specific trigger → specific system action → specific outcome",
    "Step 2: Next logical step in the same flow"
  ],

  "risksAndConsiderations": [
    {
      "risk": "Risk title",
      "description": "Why this is a concern for this specific business",
      "mitigation": "How to address or reduce this risk"
    }
  ]
}

Critical rules:
- techStack.frontend must NEVER say plain HTML — always React or Vue
- techStack.backend must always mention REST API and list specific modules
- recommendedTools must vary based on businessSize — never same tools for all sizes
- solutionOptions must always have exactly 2 options: affordable vs custom built
- risksAndConsiderations must have at least 3 risks specific to the business type
- Every reason field must mention the business size and domain explicitly
- architectureFlow steps must be specific to the business, never generic labels`;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Analyze endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { businessDescription } = req.body;

    // Validate input
    if (!businessDescription || typeof businessDescription !== "string") {
      return res.status(400).json({
        error: "businessDescription is required and must be a string",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: businessDescription,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Error in /api/analyze:", error.message);
    res.status(500).json({
      error: "Failed to analyze business description",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`BizMapper Server running on http://localhost:${PORT}`);
  console.log(`API endpoint: POST http://localhost:${PORT}/api/analyze`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. The server may already be running in another terminal.`,
    );
    console.error(
      "Run health check: Invoke-RestMethod -Uri 'http://localhost:3001/api/health' -Method Get",
    );
    process.exit(1);
  }

  console.error("Server failed to start:", error.message);
  process.exit(1);
});
