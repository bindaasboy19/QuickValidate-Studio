import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-3-flash-preview";

export async function generateExperiments(idea: any, language: string) {
  const prompt = `
    Startup Idea: ${idea.title}
    Description: ${idea.description}
    Problem: ${idea.problem}
    Target Customer: ${idea.targetCustomer}
    Assumptions: ${idea.assumptions.join(", ")}
    Constraints: Time: ${idea.timeConstraint}, Budget: ${idea.budgetConstraint}
    Language: ${language}

    Based on the above, generate 3-5 validation experiments.
    Each experiment should have:
    - name: A catchy name
    - goal: What specific assumption it tests
    - type: one of [survey, landing_page, whatsapp_outreach, field_interview, other]
    - effort: Low, Medium, or High
    - costEstimate: in INR
    - description: Brief instructions on how to run it.
  `;

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            goal: { type: Type.STRING },
            type: { type: Type.STRING },
            effort: { type: Type.STRING },
            costEstimate: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "goal", "type", "effort", "costEstimate", "description"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateValidationFeedback(idea: any, experiments: any[]) {
  const prompt = `
    Analyze the validation progress for the startup idea: "${idea.title}".
    Experiments conducted:
    ${experiments.map(e => `- ${e.name} (${e.type}): Status: ${e.status}, Metrics: ${JSON.stringify(e.metrics)}, Learnings: ${e.learnings}`).join("\n")}

    Provide:
    1. A validation score (0-100).
    2. Strengths: What is well-validated.
    3. Gaps: What still needs testing.
    4. Next Steps: 2-3 concrete actions.
  `;

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "strengths", "gaps", "nextSteps"]
      }
    }
  });

  return JSON.parse(response.text);
}
