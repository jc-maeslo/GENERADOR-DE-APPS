import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Pillar, LessonVariation, Course } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Helper to extract sources from grounding metadata
const extractSources = (response: any): string[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: string[] = [];
  chunks.forEach((chunk: any) => {
    if (chunk.web?.uri) {
      sources.push(chunk.web.uri);
    }
  });
  return Array.from(new Set(sources)); // Unique URLs
};

export const generatePillars = async (topic: string): Promise<{ pillars: Pillar[], sources: string[] }> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      pillars: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["pillars"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Actúa como un mentor experto en creación de cursos online. El usuario quiere crear contenido sobre: "${topic}".
    Genera 10 "Temas Pilar" amplios y fundamentales para este tema. Usa Google Search para asegurar que los temas son relevantes y actuales.
    Responde en formato JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "Eres CursoAPP, un mentor experto, amable y estratégico. Hablas siempre en Español.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const data = JSON.parse(text);
  const sources = extractSources(response);

  return {
    pillars: data.pillars.map((p: any, index: number) => ({ ...p, id: `pillar-${index}` })),
    sources
  };
};

export const generateVariations = async (topic: string, pillarTitle: string): Promise<{ variations: LessonVariation[], sources: string[] }> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      variations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            focus: { type: Type.STRING, description: "El enfoque pedagógico (ej: Práctico, Teórico, Análisis)" },
          },
          required: ["title", "focus"],
        },
      },
    },
    required: ["variations"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Contexto: Estamos creando un curso sobre "${topic}". Hemos elegido el pilar: "${pillarTitle}".
    Genera 10 "Variaciones de Lección" específicas para este pilar. Busca ángulos creativos y diferentes enfoques (principiantes, avanzado, casos de uso).
    Responde en formato JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "Eres CursoAPP. Genera títulos atractivos y educativos en Español.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const data = JSON.parse(text);
  const sources = extractSources(response);

  return {
    variations: data.variations.map((v: any, index: number) => ({ ...v, id: `var-${index}` })),
    sources
  };
};

export const generateCourseContent = async (topic: string, pillar: string, variationTitle: string): Promise<Course> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING, description: "Contenido educativo detallado en formato markdown (sin bloques de código grandes)" },
            imageKeyword: { type: Type.STRING, description: "Una sola palabra clave en inglés para buscar una imagen relacionada (ej: computer, business, nature)" },
          },
          required: ["title", "content", "imageKeyword"],
        },
      },
      chartData: {
        type: Type.ARRAY,
        description: "Datos numéricos relevantes al tema para generar un gráfico",
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.NUMBER },
          },
          required: ["label", "value"],
        },
      },
      chartTitle: { type: Type.STRING },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswerIndex: { type: Type.INTEGER },
          },
          required: ["question", "options", "correctAnswerIndex"],
        },
      },
    },
    required: ["title", "subtitle", "modules", "chartData", "chartTitle", "quiz"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Genera un CURSO COMPLETO y detallado para:
    Tema Global: ${topic}
    Pilar: ${pillar}
    Lección Específica: ${variationTitle}

    El curso debe ser muy visual, educativo e interactivo.
    1. Divide el contenido en 3 o 4 módulos claros.
    2. Incluye datos estadísticos o comparativos reales (usa Google Search) para poblar 'chartData'.
    3. Crea un quiz de 3 preguntas para validar el conocimiento.
    4. El contenido de los módulos debe ser rico, usando markdown para negritas y listas.
    
    IMPORTANTE: Usa Google Search para obtener datos reales y actualizados para el gráfico y el contenido.
    Responde en formato JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "Eres CursoAPP. Creas contenido educativo de clase mundial en Español. Sé riguroso y didáctico.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const data = JSON.parse(text);
  const sources = extractSources(response);

  return {
    ...data,
    sources
  };
};
