export const project = process.env.GOOGLE_CLOUD_PROJECT || 'project-915cfa66-e9ad-474f-be8';
export const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
export const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

let client;
export async function generate(contents, systemInstruction) {
  if (!client) {
    const { GoogleGenAI } = await import('@google/genai');
    client = new GoogleGenAI({
      vertexai: true, project, location,
      googleAuthOptions: { quotaProjectId: project },
      httpOptions: { timeout: 45000 }
    });
  }
  const response = await client.models.generateContent({ model, contents,
    config: { systemInstruction, temperature: 0.2, maxOutputTokens: 1200 }
  });
  if (!response.text?.trim()) throw new Error('EMPTY_RESPONSE');
  return response.text;
}

export function publicError(error) {
  const code = Number(error.status || error.code);
  if (error.code === 'ERR_MODULE_NOT_FOUND') return 'Install the backend dependencies with npm install first.';
  if (code === 401 || /default credentials|invalid_grant/i.test(error.message || '')) return 'Google authentication failed. Run gcloud auth application-default login in your terminal.';
  if (code === 403) return 'Google denied access. Check that the Vertex AI API is enabled and your account has Vertex AI User and Service Usage Consumer access in the configured project.';
  if (code === 404) return 'The configured Gemini model is unavailable in this project or location. Set GEMINI_MODEL to an available model ID.';
  if (code === 429) return 'Google quota is temporarily exhausted. Please try again later.';
  return 'Gemini could not be reached or returned no answer. Check the backend connection and project configuration.';
}
