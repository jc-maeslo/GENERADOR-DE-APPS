import React, { useState } from 'react';
import { Course } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, BarChart2, CheckCircle, ChevronLeft, Award, ExternalLink } from 'lucide-react';

interface CourseViewProps {
  course: Course;
  onBack: () => void;
}

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#312e81', '#6366f1'];

const CourseView: React.FC<CourseViewProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'data' | 'quiz'>('content');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(course.quiz.length).fill(-1));
  const [showQuizResults, setShowQuizResults] = useState(false);

  const handleQuizSelect = (questionIndex: number, optionIndex: number) => {
    if (showQuizResults) return;
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    course.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  const activeModule = course.modules[activeModuleIndex];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in-up">
      {/* Header */}
      <div className="bg-indigo-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-16 -mb-16"></div>
        
        <button 
          onClick={onBack}
          className="relative z-10 flex items-center text-indigo-200 hover:text-white mb-4 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver a variaciones
        </button>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 leading-tight">{course.title}</h1>
          <p className="text-indigo-200 text-lg max-w-2xl">{course.subtitle}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50 sticky top-0 z-20">
        <button
          onClick={() => setActiveTab('content')}
          className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 ${
            activeTab === 'content' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Módulos
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 ${
            activeTab === 'data' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          Datos y Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 ${
            activeTab === 'quiz' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-5 h-5" />
          Evaluación
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white scroll-smooth">
        
        {/* TAB: CONTENT */}
        {activeTab === 'content' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Modules List */}
            <div className="lg:w-1/4 flex-shrink-0">
              <nav className="space-y-2 sticky top-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Estructura del Curso</h3>
                {course.modules.map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeModuleIndex === idx
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="opacity-50 mr-2">{idx + 1}.</span> {mod.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Module Detail */}
            <div className="lg:w-3/4 animate-fade-in">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 shadow-md">
                <img 
                  src={`https://picsum.photos/seed/${activeModule.imageKeyword + activeModuleIndex}/800/400`} 
                  alt={activeModule.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <h2 className="text-white text-2xl font-bold p-6">{activeModule.title}</h2>
                </div>
              </div>
              
              <div className="prose prose-indigo max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600">
                <div dangerouslySetInnerHTML={{ 
                  __html: activeModule.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }} />
              </div>
            </div>
          </div>
        )}

        {/* TAB: DATA */}
        {activeTab === 'data' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{course.chartTitle || "Datos Relevantes"}</h2>
                <p className="text-slate-500 mb-8">Análisis visual basado en datos reales del sector.</p>
                
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={course.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {course.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 text-sm text-slate-400 text-center">
                   Fuente: Datos agregados vía Google Search
                </div>
             </div>
          </div>
        )}

        {/* TAB: QUIZ */}
        {activeTab === 'quiz' && (
           <div className="max-w-2xl mx-auto animate-fade-in pb-12">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-800">Pon a prueba tu conocimiento</h2>
               <p className="text-slate-500">Responde estas preguntas breves para validar lo aprendido.</p>
             </div>

             <div className="space-y-8">
               {course.quiz.map((q, qIdx) => (
                 <div key={qIdx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <h3 className="font-semibold text-lg text-slate-800 mb-4">{qIdx + 1}. {q.question}</h3>
                   <div className="space-y-3">
                     {q.options.map((opt, oIdx) => {
                       const isSelected = quizAnswers[qIdx] === oIdx;
                       const isCorrect = q.correctAnswerIndex === oIdx;
                       let buttonStyle = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
                       
                       if (showQuizResults) {
                         if (isCorrect) buttonStyle = "border-green-500 bg-green-50 text-green-700 font-medium";
                         else if (isSelected && !isCorrect) buttonStyle = "border-red-300 bg-red-50 text-red-700";
                         else buttonStyle = "border-slate-100 opacity-50";
                       } else if (isSelected) {
                         buttonStyle = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500";
                       }

                       return (
                         <button
                           key={oIdx}
                           onClick={() => handleQuizSelect(qIdx, oIdx)}
                           disabled={showQuizResults}
                           className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between ${buttonStyle}`}
                         >
                           <span>{opt}</span>
                           {showQuizResults && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                         </button>
                       )
                     })}
                   </div>
                 </div>
               ))}
             </div>

             <div className="mt-8 flex justify-center">
                {!showQuizResults ? (
                  <button
                    onClick={() => setShowQuizResults(true)}
                    disabled={quizAnswers.includes(-1)}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                  >
                    Ver Resultados
                  </button>
                ) : (
                  <div className="text-center p-6 bg-indigo-50 rounded-xl w-full border border-indigo-100">
                    <p className="text-xl font-bold text-indigo-900 mb-2">
                      Tu Puntuación: {calculateScore()} / {course.quiz.length}
                    </p>
                    <p className="text-indigo-600">
                      {calculateScore() === course.quiz.length 
                        ? "¡Excelente! Dominas este tema." 
                        : "Buen intento. Revisa los módulos para reforzar conceptos."}
                    </p>
                    <button 
                      onClick={() => {
                        setShowQuizResults(false);
                        setQuizAnswers(new Array(course.quiz.length).fill(-1));
                      }}
                      className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
             </div>
           </div>
        )}

      </div>

      {/* Sources Footer */}
      {course.sources && course.sources.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-x-4 gap-y-1 items-center">
            <span className="font-semibold">Fuentes:</span>
            {course.sources.map((src, i) => (
              <a 
                key={i} 
                href={src} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center hover:text-indigo-600 hover:underline transition-colors"
              >
                {new URL(src).hostname.replace('www.', '')} <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;