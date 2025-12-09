import React, { useState } from 'react';
import { Loader2, Sparkles, Layers, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { generatePillars, generateVariations, generateCourseContent } from './services/geminiService';
import { Pillar, LessonVariation, Course, AppStep } from './types';
import CourseView from './components/CourseView';

function App() {
  const [step, setStep] = useState<AppStep>('INPUT');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  
  // Data State
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [variations, setVariations] = useState<LessonVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<LessonVariation | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [sources, setSources] = useState<string[]>([]);

  // STEP 1: Generate Pillars
  const handleGeneratePillars = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setSources([]);
    try {
      const { pillars: generatedPillars, sources: src } = await generatePillars(topic);
      setPillars(generatedPillars);
      setSources(src);
      setStep('PILLARS');
    } catch (error) {
      console.error("Error generating pillars:", error);
      alert("Hubo un error generando los temas. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Generate Variations
  const handleSelectPillar = async (pillar: Pillar) => {
    setSelectedPillar(pillar);
    setIsLoading(true);
    setSources([]);
    try {
      const { variations: generatedVariations, sources: src } = await generateVariations(topic, pillar.title);
      setVariations(generatedVariations);
      setSources(src);
      setStep('VARIATIONS');
    } catch (error) {
      console.error("Error generating variations:", error);
      alert("Error al crear variaciones. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Generate Course
  const handleSelectVariation = async (variation: LessonVariation) => {
    setSelectedVariation(variation);
    setIsLoading(true);
    setSources([]);
    try {
      if (!selectedPillar) return;
      const courseData = await generateCourseContent(topic, selectedPillar.title, variation.title);
      setCourse(courseData);
      setStep('COURSE');
    } catch (error) {
      console.error("Error generating course:", error);
      alert("No se pudo generar el curso completo. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToVariations = () => {
    setStep('VARIATIONS');
    setCourse(null);
  };

  // UI Components
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 flex flex-col items-center max-w-sm w-full">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Trabajando en tu estrategia...</h3>
        <p className="text-slate-500 text-center text-sm">
          {step === 'INPUT' && "Analizando tendencias y generando pilares temáticos."}
          {step === 'PILLARS' && "Diseñando lecciones específicas y creativas."}
          {step === 'VARIATIONS' && "Redactando contenido, diseñando gráficos y creando el quiz."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {isLoading && <LoadingOverlay />}

      {/* Main Container */}
      <div className={`transition-all duration-500 ease-in-out ${step === 'COURSE' ? 'max-w-7xl px-4 py-6' : 'max-w-3xl px-6 py-12'} mx-auto h-screen flex flex-col`}>
        
        {/* Header (Hidden in Course View for immersion) */}
        {step !== 'COURSE' && (
          <header className="mb-12 text-center animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-200">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
              CursoAPP
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Tu coach inteligente para transformar una idea simple en una estrategia de formación completa.
            </p>
          </header>
        )}

        <main className="flex-1 relative">
          
          {/* STEP 0: INPUT */}
          {step === 'INPUT' && (
            <div className="animate-fade-in w-full max-w-xl mx-auto">
              <form onSubmit={handleGeneratePillars} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-xl shadow-xl p-8 border border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">¿Sobre qué quieres enseñar?</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ej: Marketing Digital, Cocina Vegana, Liderazgo..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg placeholder:text-slate-400"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!topic.trim() || isLoading}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 text-center text-sm text-slate-400">
                <p>Powered by Gemini 2.5 Flash & Google Search</p>
              </div>
            </div>
          )}

          {/* STEP 1: PILLARS */}
          {step === 'PILLARS' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Paso 1: Elige un Tema Pilar
                </h2>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Tema: {topic}</span>
              </div>
              
              <div className="grid gap-4">
                {pillars.map((pillar) => (
                  <button
                    key={pillar.id}
                    onClick={() => handleSelectPillar(pillar)}
                    className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left flex items-start justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 mb-1">{pillar.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{pillar.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 mt-1 flex-shrink-0" />
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('INPUT')} className="mt-6 text-sm text-slate-500 hover:text-slate-800 underline">
                &larr; Volver a cambiar tema
              </button>
            </div>
          )}

          {/* STEP 2: VARIATIONS */}
          {step === 'VARIATIONS' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Paso 2: Elige una Lección
                </h2>
                <div className="flex flex-col items-end">
                   <span className="text-xs text-slate-400 uppercase tracking-wide">Pilar Seleccionado</span>
                   <span className="text-sm font-medium text-indigo-700">{selectedPillar?.title}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {variations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => handleSelectVariation(variation)}
                    className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 transition-all text-left flex flex-col h-full"
                  >
                    <div className="flex-1">
                        <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-500 mb-3 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                            {variation.focus}
                        </span>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 leading-snug">
                            {variation.title}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Crear Curso <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </button>
                ))}
              </div>
               <button onClick={() => setStep('PILLARS')} className="mt-6 text-sm text-slate-500 hover:text-slate-800 underline">
                &larr; Volver a elegir pilar
              </button>
            </div>
          )}

          {/* STEP 3: COURSE VIEW */}
          {step === 'COURSE' && course && (
            <div className="h-full">
              <CourseView course={course} onBack={handleBackToVariations} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;