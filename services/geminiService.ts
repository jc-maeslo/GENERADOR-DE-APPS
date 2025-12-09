import { GoogleGenAI } from "@google/genai";
import { Pillar, LessonVariation, Course, ImageSize } from "../types";

const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-3-pro-image-preview";

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

// Helper to parse JSON from text that might contain markdown or extra characters
const parseJSON = (text: string) => {
  try {
    // Attempt clean parse
    return JSON.parse(text);
  } catch (e) {
    // Attempt to extract JSON block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e2) {
        throw new Error("Failed to parse JSON response");
      }
    }
    throw new Error("No JSON found in response");
  }
};

export const generatePillars = async (topic: string): Promise<{ pillars: Pillar[], sources: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Actúa como un mentor experto en creación de cursos online. El usuario quiere crear contenido sobre: "${topic}".
    Genera 10 "Temas Pilar" amplios y fundamentales para este tema. Usa Google Search para asegurar que los temas son relevantes y actuales.
    
    Responde EXCLUSIVAMENTE con un JSON válido que tenga la siguiente estructura:
    {
      "pillars": [
        { "title": "Título del pilar", "description": "Breve descripción" }
      ]
    }`,
    config: {
      tools: [{ googleSearch: {} }],
      // responseSchema and responseMimeType are NOT allowed with googleSearch
      systemInstruction: "Eres CursoAPP, un mentor experto. Responde siempre en JSON válido.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const data = parseJSON(text);
  const sources = extractSources(response);

  return {
    pillars: data.pillars.map((p: any, index: number) => ({ ...p, id: `pillar-${index}` })),
    sources
  };
};

export const generateVariations = async (topic: string, pillarTitle: string): Promise<{ variations: LessonVariation[], sources: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Contexto: Estamos creando un curso sobre "${topic}". Hemos elegido el pilar: "${pillarTitle}".
    Genera 10 "Variaciones de Lección" específicas para este pilar. Busca ángulos creativos.
    
    Responde EXCLUSIVAMENTE con un JSON válido con esta estructura:
    {
      "variations": [
        { "title": "Título", "focus": "Enfoque (Práctico, Teórico, etc)" }
      ]
    }`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "Eres CursoAPP. Responde siempre en JSON válido.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const data = parseJSON(text);
  const sources = extractSources(response);

  return {
    variations: data.variations.map((v: any, index: number) => ({ ...v, id: `var-${index}` })),
    sources
  };
};

export const generateCourseContent = async (topic: string, pillar: string, variationTitle: string): Promise<Course> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Genera un CURSO COMPLETO y detallado para:
    Tema Global: ${topic}
    Pilar: ${pillar}
    Lección Específica: ${variationTitle}

    El curso debe ser muy visual, educativo e interactivo.
    1. Divide el contenido en 3 o 4 módulos claros.
    2. Incluye datos estadísticos o comparativos reales (usa Google Search) para poblar 'chartData'.
    3. Crea un quiz final de 3 preguntas.
    4. Proporciona un 'imageKeyword' en Inglés para cada módulo.
    5. Para CADA módulo, genera 3 "keyPoints" (puntos clave resumidos) y un "miniQuiz" (1 pregunta de repaso con 2-3 opciones) para hacer la lección interactiva.
    
    IMPORTANTE: Usa Google Search para obtener datos reales.
    
    Responde EXCLUSIVAMENTE con un JSON válido con esta estructura:
    {
      "title": "Título del Curso",
      "subtitle": "Subtítulo atractivo",
      "modules": [
        { 
          "title": "Título Módulo", 
          "content": "Markdown content...", 
          "imageKeyword": "keyword",
          "keyPoints": ["Punto 1", "Punto 2", "Punto 3"],
          "miniQuiz": {
             "question": "Pregunta de repaso",
             "options": ["Opción A", "Opción B"],
             "correctAnswerIndex": 0,
             "explanation": "Breve explicación de por qué es correcta"
          }
        }
      ],
      "chartData": [
        { "label": "Etiqueta", "value": 10 }
      ],
      "chartTitle": "Título del gráfico",
      "quiz": [
        { "question": "Pregunta", "options": ["A","B","C"], "correctAnswerIndex": 0 }
      ]
    }`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "Eres CursoAPP. Creas contenido educativo de clase mundial. Responde solo JSON.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const data = parseJSON(text);
  const sources = extractSources(response);

  return {
    ...data,
    sources
  };
};

export const generateModuleImage = async (title: string, keyword: string, size: ImageSize): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [
          { text: `Generate a high-quality, photorealistic, educational header image for a course module. 
                   Module Title: "${title}". 
                   Visual Subject: "${keyword}".
                   Style: Professional, clean, lighting suitable for a website header.` }
        ]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "16:9" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error(`Failed to generate image for ${title}`, e);
    return undefined;
  }
  return undefined;
};
