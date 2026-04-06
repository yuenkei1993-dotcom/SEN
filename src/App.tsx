/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Home, CheckCircle2, XCircle, Volume2, ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Student, Task, AppState } from './types';
import { INITIAL_STUDENTS, INITIAL_TASKS } from './constants';
import { speak } from './lib/tts';

export default function App() {
  const [state, setState] = useState<AppState>('selection');
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sen_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('sen_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showSentence, setShowSentence] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sen_students', JSON.stringify(students));
    localStorage.setItem('sen_tasks', JSON.stringify(tasks));
  }, [students, tasks]);

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
          <button 
            onClick={() => setState(state === 'teacher' ? 'selection' : 'teacher')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="老師管理"
          >
            <Settings className="w-6 h-6 text-slate-600" />
          </button>
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

          {state === 'teacher' && (
            <TeacherDashboard 
              students={students} 
              setStudents={setStudents}
              tasks={tasks}
              setTasks={setTasks}
            />
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

function TeacherDashboard({ students, setStudents, tasks, setTasks }: {
  students: Student[],
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}) {
  const [activeTab, setActiveTab] = useState<'students' | 'tasks'>('students');

  const addStudent = () => {
    const newStudent: Student = {
      id: Date.now().toString(),
      name: '新學生',
      photoUrl: 'https://picsum.photos/seed/' + Math.random() + '/400/400',
      finalSentence: '練習完成！'
    };
    setStudents([...students, newStudent]);
  };

  const addTask = (studentId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      studentId,
      correctImageUrl: 'https://picsum.photos/seed/correct' + Math.random() + '/600/400',
      incorrectImageUrl: 'https://picsum.photos/seed/wrong' + Math.random() + '/600/400',
      sentence: '請輸入描述句子',
      happySentence: '請輸入開心句子'
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">老師管理後台</h2>
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'students' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
          >
            學生名單
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'tasks' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
          >
            教材內容
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {activeTab === 'students' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, idx) => (
              <div key={student.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-slate-100">
                  <img src={student.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <ImageIcon className="text-white w-6 h-6" />
                    <input 
                      type="text" 
                      className="hidden" 
                      onChange={(e) => {
                        const newUrl = prompt('請輸入照片網址', student.photoUrl);
                        if (newUrl) {
                          const updated = [...students];
                          updated[idx].photoUrl = newUrl;
                          setStudents(updated);
                        }
                      }} 
                    />
                  </label>
                </div>
                <input 
                  type="text" 
                  value={student.name}
                  onChange={(e) => {
                    const updated = [...students];
                    updated[idx].name = e.target.value;
                    setStudents(updated);
                  }}
                  className="w-full text-center font-bold text-lg border-b border-transparent focus:border-indigo-300 outline-none"
                />
                <input 
                  type="text" 
                  value={student.finalSentence}
                  onChange={(e) => {
                    const updated = [...students];
                    updated[idx].finalSentence = e.target.value;
                    setStudents(updated);
                  }}
                  placeholder="輸入完成後的句子"
                  className="w-full text-center text-sm text-slate-500 border-b border-transparent focus:border-indigo-300 outline-none"
                />
                <button 
                  onClick={() => setStudents(students.filter(s => s.id !== student.id))}
                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> 刪除學生
                </button>
              </div>
            ))}
            <button 
              onClick={addStudent}
              className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-500 hover:text-indigo-600 min-h-[200px]"
            >
              <Plus className="w-8 h-8" />
              <span className="font-medium">新增學生</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {students.map(student => (
              <div key={student.id} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-xl font-bold text-indigo-900">{student.name} 的教材</h3>
                  <button 
                    onClick={() => addTask(student.id)}
                    className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> 新增題目
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {tasks.filter(t => t.studentId === student.id).map((task, tIdx) => (
                    <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">正確圖片網址</label>
                        <input 
                          type="text" 
                          value={task.correctImageUrl}
                          onChange={(e) => {
                            const updated = [...tasks];
                            const index = tasks.findIndex(t => t.id === task.id);
                            updated[index].correctImageUrl = e.target.value;
                            setTasks(updated);
                          }}
                          className="w-full text-sm p-2 bg-slate-50 rounded border focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">錯誤圖片網址</label>
                        <input 
                          type="text" 
                          value={task.incorrectImageUrl}
                          onChange={(e) => {
                            const updated = [...tasks];
                            const index = tasks.findIndex(t => t.id === task.id);
                            updated[index].incorrectImageUrl = e.target.value;
                            setTasks(updated);
                          }}
                          className="w-full text-sm p-2 bg-slate-50 rounded border focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-slate-400 uppercase">描述句子 (朗讀內容)</label>
                        <input 
                          type="text" 
                          value={task.sentence}
                          onChange={(e) => {
                            const updated = [...tasks];
                            const index = tasks.findIndex(t => t.id === task.id);
                            updated[index].sentence = e.target.value;
                            setTasks(updated);
                          }}
                          className="w-full text-sm p-2 bg-slate-50 rounded border focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-slate-400 uppercase">開心句子 (朗讀內容)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={task.happySentence}
                            onChange={(e) => {
                              const updated = [...tasks];
                              const index = tasks.findIndex(t => t.id === task.id);
                              updated[index].happySentence = e.target.value;
                              setTasks(updated);
                            }}
                            className="flex-1 text-sm p-2 bg-slate-50 rounded border focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                          <button 
                            onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
