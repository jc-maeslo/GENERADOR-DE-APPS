export interface Pillar {
  id: string;
  title: string;
  description: string;
}

export interface LessonVariation {
  id: string;
  title: string;
  focus: string; // e.g., "Práctico", "Teórico", "Caso de Estudio"
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface CourseModule {
  title: string;
  content: string; // Markdown supported
  imageKeyword: string;
}

export interface Course {
  title: string;
  subtitle: string;
  modules: CourseModule[];
  chartData: ChartDataPoint[];
  chartTitle: string;
  quiz: QuizQuestion[];
  sources: string[]; // URLs from grounding
}

export type AppStep = 'INPUT' | 'PILLARS' | 'VARIATIONS' | 'COURSE';
