/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, CheckCircle2, XCircle, Volume2, ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Student, Task, AppState } from './types';
import { INITIAL_STUDENTS, INITIAL_TASKS } from './constants';
import { speak } from './lib/tts';

export default function App() {
  const [state, setState] = useState<AppState>('selection');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showSentence, setShowSentence] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // No persistence needed anymore

  const studentTasks = useMemo(() => {
    if (!selectedStudent) return [];
    return tasks.filter(t => t.studentId === selectedStudent.id);
  }, [selectedStudent, tasks]);

  const currentTask = studentTasks[currentTaskIndex];

  // Randomize positions for the two choices
  const [isCorrectOnLeft, setIsCorrectOnLeft] = useState(Math.random() > 0.5);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentTaskIndex(0);
    setWrongAttempts(0);
    setIsCorrectOnLeft(Math.random() > 0.5);
    setState('learning');
  };

  const handleChoice = async (isCorrect: boolean) => {
    if (isCorrect) {
      // Store the selected sentence for the summary
      const updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex(t => t.id === currentTask.id);
      updatedTasks[taskIndex].userSelectedSentence = currentTask.happySentence;
      setTasks(updatedTasks);

      setFeedback('correct');
      setShowSentence(true);
      setWrongAttempts(0);
      await speak(currentTask.happySentence);
    } else {
      setFeedback('incorrect');
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const nextTask = () => {
    if (currentTaskIndex < studentTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setFeedback(null);
      setShowSentence(false);
      setIsCorrectOnLeft(Math.random() > 0.5);
    } else {
      // All tasks done, go to summary page
      setState('final');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Volume2 className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">SEN 學習助手</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {state !== 'selection' && (
            <button 
              onClick={() => {
                setState('selection');
                setSelectedStudent(null);
                setShowSentence(false);
                setFeedback(null);
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              title="回到首頁"
            >
              <Home className="w-6 h-6 text-slate-600" />
            </button>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {state === 'selection' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col items-center justify-center gap-12"
            >
              <h2 className="text-3xl font-bold text-slate-800">請選擇學生</h2>
              <div className="flex flex-wrap justify-center gap-12">
                {students.map((student) => (
                  <motion.button
                    key={student.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStudentSelect(student)}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl group-hover:border-indigo-200 transition-all">
                      <img 
                        src={student.photoUrl} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-2xl font-bold text-slate-700">{student.name || '未命名學生'}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {state === 'learning' && selectedStudent && currentTask && (
            <motion.div 
              key="learning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
                  <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h2 className="text-xl font-semibold text-slate-600">
                  {selectedStudent.name} 的練習 ({currentTaskIndex + 1} / {studentTasks.length})
                </h2>
              </div>

              {!showSentence ? (
                <div className="flex-1 w-full flex items-center justify-center gap-16 max-w-5xl">
                  {/* Choice 1 */}
                  <ChoiceCard 
                    imageUrl={isCorrectOnLeft ? currentTask.correctImageUrl : currentTask.incorrectImageUrl}
                    isCorrect={isCorrectOnLeft}
                    onClick={() => handleChoice(isCorrectOnLeft)}
                    feedback={feedback}
                    hint={wrongAttempts >= 2 && isCorrectOnLeft}
                  />

                  {/* Choice 2 */}
                  <ChoiceCard 
                    imageUrl={isCorrectOnLeft ? currentTask.incorrectImageUrl : currentTask.correctImageUrl}
                    isCorrect={!isCorrectOnLeft}
                    onClick={() => handleChoice(!isCorrectOnLeft)}
                    feedback={feedback}
                    hint={wrongAttempts >= 2 && !isCorrectOnLeft}
                  />
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-1 w-full flex flex-col items-center justify-center gap-8"
                >
                  <div className="w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                    <img 
                      src={currentTask.correctImageUrl} 
                      alt="Correct" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-white px-12 py-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-6 max-w-3xl text-center">
                    <p className="text-4xl font-bold text-indigo-900 leading-tight">
                      {currentTask.happySentence}
                    </p>
                    <button 
                      onClick={nextTask}
                      className="mt-4 px-12 py-4 bg-indigo-600 text-white rounded-2xl text-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-3"
                    >
                      下一個 <ChevronRight className="w-8 h-8" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {state === 'final' && selectedStudent && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full flex flex-col items-center justify-center gap-8 p-6"
            >
              <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-3xl w-full">
                <h2 className="text-4xl font-bold text-indigo-900 mb-8">練習總結</h2>
                <button 
                  onClick={() => speak(studentTasks.map(t => t.userSelectedSentence || t.happySentence).join(' '))}
                  className="w-full p-8 bg-white hover:bg-indigo-50 rounded-3xl shadow-sm border border-slate-200 transition-colors flex flex-col items-center gap-8"
                >
                  <div className="flex flex-wrap justify-center gap-4">
                    {studentTasks.map((task) => (
                      <div key={task.id} className="w-40 h-28 rounded-2xl overflow-hidden shadow-md">
                        <img 
                          src={task.correctImageUrl} 
                          alt="Task" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="text-3xl font-bold text-indigo-900 text-center flex-1">
                      {studentTasks.map(t => t.userSelectedSentence || t.happySentence).join(' ')}
                    </span>
                    <Volume2 className="w-12 h-12 text-indigo-500 flex-shrink-0" />
                  </div>
                </button>
                <p className="text-3xl font-bold text-slate-700 mb-8 mt-12">
                  {selectedStudent.finalSentence}
                </p>
                <button 
                  onClick={() => {
                    setState('selection');
                    setSelectedStudent(null);
                    // Clear user selections for next time
                    const clearedTasks = tasks.map(t => ({...t, userSelectedSentence: undefined}));
                    setTasks(clearedTasks);
                  }}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-2xl text-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  完成
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Feedback Overlays */}
      <AnimatePresence>
        {feedback === 'incorrect' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/20 pointer-events-none z-[100] flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-full shadow-2xl"
            >
              <XCircle className="w-24 h-24 text-red-500" />
            </motion.div>
          </motion.div>
        )}
        {feedback === 'correct' && !showSentence && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500/20 pointer-events-none z-[100] flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-full shadow-2xl"
            >
              <CheckCircle2 className="w-24 h-24 text-green-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function ChoiceCard({ imageUrl, isCorrect, onClick, feedback, hint }: { 
  imageUrl: string, 
  isCorrect: boolean, 
  onClick: () => void,
  feedback: 'correct' | 'incorrect' | null,
  hint: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      animate={
        feedback === 'incorrect' && !isCorrect ? { x: [0, -10, 10, -10, 10, 0] } : 
        hint ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(79, 70, 229, 0)", "0 0 30px rgba(79, 70, 229, 0.4)", "0 0 0px rgba(79, 70, 229, 0)"] } : 
        {}
      }
      transition={hint ? { repeat: Infinity, duration: 1.5 } : { duration: 0.4 }}
      className={`relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl border-8 transition-all duration-300 ${
        feedback === 'incorrect' && !isCorrect ? 'border-red-200 grayscale opacity-50' : 'border-white'
      } ${hint ? 'ring-8 ring-indigo-400 ring-offset-4' : ''}`}
    >
      <img 
        src={imageUrl} 
        alt="Choice" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </motion.button>
  );
}
