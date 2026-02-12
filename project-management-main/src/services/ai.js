import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are an expert Project Management Assistant for a platform called "Fizz".
Your goal is to help users plan, organize, and manage their projects effectively.
You have access to project details and task lists.
When suggesting tasks, provide:
1. Title
2. Short Description
3. Suggested Due Date (relative to today or project timeline)
4. Priority (LOW, MEDIUM, HIGH)

Be concise, professional, and encouraging.
`;

export const aiService = {
    async generateContent(prompt, context = "") {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const fullPrompt = context
                ? `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nUser Question: ${prompt}`
                : `${SYSTEM_PROMPT}\n\nUser Question: ${prompt}`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini AI Error:", error);
            throw new Error("I'm having trouble thinking right now. Please try again later.");
        }
    },

    async getProjectSuggestions(project, tasks = []) {
        const context = `
            Project Name: ${project.name}
            Description: ${project.description}
            Start Date: ${project.start_date}
            End Date: ${project.end_date}
            Current Tasks: ${tasks.map(t => t.title).join(", ")}
        `;
        const prompt = "Suggest 3-5 next logical tasks I should add to this project to ensure its success. Provide them in a structured format.";
        return this.generateContent(prompt, context);
    }
};
