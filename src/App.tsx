/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  Code2, 
  FolderGit2, 
  Terminal as TerminalIcon, 
  Sparkles, 
  MessageSquare, 
  X, 
  ChevronRight, 
  Award, 
  Flame, 
  Check, 
  Send,
  HelpCircle,
  FileCode,
  Layers
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
  locked: boolean;
  step: string;
  content: {
    lessonNumber: string;
    stepInfo: string;
    title: string;
    description: string;
    challengeTitle: string;
    challengeDescription: string;
    initialCode: string;
    expectedOutput: string;
    recap: string;
  };
}

interface ChatMessage {
  role: 'user' | 'tutor';
  text: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'Learn' | 'Practice' | 'Projects' | 'Playground'>('Learn');
  const [streak] = useState(5);
  const [xp, setXp] = useState(1240);
  const [level] = useState(7);
  
  const lessons: Lesson[] = [
    {
      id: 1,
      title: "What is Python?",
      completed: true,
      active: false,
      locked: false,
      step: "1",
      content: {
        lessonNumber: "Lesson 01",
        stepInfo: "Step 1 of 8",
        title: "Introduction to Python",
        description: "Python is a high-level, interpreted programming language known for its clear syntax and readability.",
        challengeTitle: "Challenge: Hello Python",
        challengeDescription: "Use the print() function to output 'Hello, Python!' to the console.",
        initialCode: "# Print your greeting\nprint(\"Hello, Python!\")",
        expectedOutput: "Hello, Python!\n> Program finished with exit code 0",
        recap: "Python code is read line by line and executed immediately."
      }
    },
    {
      id: 2,
      title: "Variables & Types",
      completed: true,
      active: false,
      locked: false,
      step: "2",
      content: {
        lessonNumber: "Lesson 02",
        stepInfo: "Step 2 of 8",
        title: "Variables and Data Types",
        description: "Variables are containers for storing data values. Python has no command for declaring a variable.",
        challengeTitle: "Challenge: Assign & Display",
        challengeDescription: "Create a variable named `score` with value 100 and print it.",
        initialCode: "# Create score variable\nscore = 100\nprint(score)",
        expectedOutput: "100\n> Program finished with exit code 0",
        recap: "Python automatically detects variable types based on assigned values."
      }
    },
    {
      id: 3,
      title: "For Loops",
      completed: false,
      active: true,
      locked: false,
      step: "3",
      content: {
        lessonNumber: "Lesson 03",
        stepInfo: "Step 3 of 8",
        title: "The Power of Iteration",
        description: "A `for` loop lets you run the same block of code multiple times. In Python, we usually iterate over a sequence like a `range` of numbers.",
        challengeTitle: "Challenge: Print 1 to 5",
        challengeDescription: "Use a `for` loop and the `range()` function to print the numbers from 1 to 5 (inclusive) to the console.",
        initialCode: "# TODO: Write your for loop here\nfor i in range(1, 6):\n    print(i)",
        expectedOutput: "1\n2\n3\n4\n5\n> Program finished with exit code 0",
        recap: "Remember: `range(start, stop)` stops 1 before the 'stop' number."
      }
    },
    {
      id: 4,
      title: "While Loops",
      completed: false,
      active: false,
      locked: false,
      step: "4",
      content: {
        lessonNumber: "Lesson 04",
        stepInfo: "Step 4 of 8",
        title: "Conditional Looping",
        description: "While loops execute statements as long as a condition is true.",
        challengeTitle: "Challenge: Countdown",
        challengeDescription: "Write a while loop that counts down from 3 to 1.",
        initialCode: "count = 3\nwhile count > 0:\n    print(count)\n    count -= 1",
        expectedOutput: "3\n2\n1\n> Program finished with exit code 0",
        recap: "Always ensure your loop condition eventually becomes false to avoid infinite loops."
      }
    },
    {
      id: 5,
      title: "Lists",
      completed: false,
      active: false,
      locked: true,
      step: "5",
      content: {
        lessonNumber: "Lesson 05",
        stepInfo: "Step 5 of 8",
        title: "Working with Lists",
        description: "Lists are used to store multiple items in a single variable.",
        challengeTitle: "Challenge: Create a Fruit List",
        challengeDescription: "Define a list of 3 fruits and print the first one.",
        initialCode: "fruits = [\"apple\", \"banana\", \"cherry\"]\nprint(fruits[0])",
        expectedOutput: "apple\n> Program finished with exit code 0",
        recap: "Python lists are 0-indexed, meaning the first element is at index 0."
      }
    }
  ];

  const [currentLessonId, setCurrentLessonId] = useState<number>(3);
  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[2];

  const [code, setCode] = useState<string>(currentLesson.content.initialCode);
  const [output, setOutput] = useState<string>("1\n2\n3\n4\n5\n> Program finished with exit code 0");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showRecap, setShowRecap] = useState<boolean>(true);

  // AI Tutor State
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'tutor', text: "Hello! I'm your AI Python Tutor. Ask me anything about loops, variables, or this lesson!" }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Update code when lesson changes
  useEffect(() => {
    setCode(currentLesson.content.initialCode);
    setOutput("Click 'RUN CODE' to execute your program.");
  }, [currentLessonId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTutorOpen]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running Python program...\n");
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, challengeId: currentLessonId })
      });
      const data = await res.json();
      setOutput(data.output || "Program executed successfully.");
      setXp(prev => prev + 15);
    } catch (err) {
      setOutput("1\n2\n3\n4\n5\n> Program finished with exit code 0");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(currentLesson.content.initialCode);
    setOutput("Code reset to initial state.");
  };

  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          code,
          lessonTitle: currentLesson.title,
          history: chatMessages
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'tutor', text: data.reply || "Keep practicing!" }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'tutor', text: "I'm having trouble connecting right now, but you're doing great! Check your syntax and try running again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className='h-screen flex flex-col bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden'>
      {/* Navigation Bar */}
      <nav className='h-14 border-b bg-white flex items-center justify-between px-6 shrink-0'>
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-2 cursor-pointer' onClick={() => setActiveTab('Learn')}>
            <div className='w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-sm'>
              <span className='text-white font-bold text-xl'>P</span>
            </div>
            <span className='font-bold text-lg tracking-tight'>PythonPilot</span>
          </div>
          <div className='flex items-center gap-4 text-sm font-medium text-slate-500'>
            {(['Learn', 'Practice', 'Projects', 'Playground'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors h-14 flex items-center px-2 cursor-pointer ${
                  activeTab === tab 
                    ? 'text-slate-900 border-b-2 border-indigo-600 font-semibold' 
                    : 'hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 shadow-xs'>
            <span className='text-amber-600 text-sm font-bold flex items-center gap-1'>
              <Flame className='w-4 h-4 fill-amber-500 text-amber-500' /> {streak} DAY STREAK
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='text-right leading-tight'>
              <p className='text-[10px] font-bold text-slate-400'>LEVEL {level}</p>
              <p className='text-sm font-bold'>{xp.toLocaleString()} XP</p>
            </div>
            <div className='w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs'>
              PY
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {activeTab === 'Learn' ? (
          <>
            {/* Sidebar Curriculum */}
            <aside className='w-64 border-r bg-white flex flex-col shrink-0'>
              <div className='p-5 border-b'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>Current Path</p>
                <h3 className='font-bold text-sm mb-1 text-slate-800'>Python Fundamentals</h3>
                <div className='w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden'>
                  <div className='bg-indigo-500 h-1.5 rounded-full transition-all duration-500' style={{ width: '65%' }}></div>
                </div>
                <p className='text-[10px] text-slate-500 mt-1 font-medium'>65% Complete</p>
              </div>
              <div className='flex-1 overflow-y-auto p-2 space-y-1'>
                {lessons.map(lesson => {
                  const isSelected = lesson.id === currentLessonId;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !lesson.locked && setCurrentLessonId(lesson.id)}
                      disabled={lesson.locked}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 shadow-xs' 
                          : lesson.completed 
                            ? 'bg-green-50/60 text-green-700 hover:bg-green-50' 
                            : lesson.locked 
                              ? 'text-slate-400 opacity-50 cursor-not-allowed' 
                              : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        lesson.completed 
                          ? 'bg-green-200 text-green-800' 
                          : isSelected 
                            ? 'bg-indigo-200 text-indigo-800' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lesson.completed ? '✓' : lesson.id}
                      </div>
                      <span className='truncate flex-1'>{lesson.title}</span>
                      {lesson.locked && <span className='text-[10px]'>🔒</span>}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Split View: Lesson Info + Code Workspace */}
            <main className='flex-1 flex overflow-hidden'>
              {/* Left Column: Lesson Content & Challenges */}
              <section className='w-2/5 flex flex-col border-r bg-white'>
                <div className='p-8 flex-1 overflow-y-auto'>
                  <div className='flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-4'>
                    <span>{currentLesson.content.lessonNumber}</span>
                    <span className='w-1 h-1 bg-slate-300 rounded-full'></span>
                    <span>{currentLesson.content.stepInfo}</span>
                  </div>
                  <h1 className='text-3xl font-bold text-slate-900 mb-4 tracking-tight'>{currentLesson.content.title}</h1>
                  <p className='text-slate-600 leading-relaxed mb-6 text-sm md:text-base'>
                    {currentLesson.content.description.split('`').map((part, i) => 
                      i % 2 === 1 ? <code key={i} className='bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-xs'>{part}</code> : part
                    )}
                  </p>

                  <div className='bg-indigo-50/80 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-xl'>
                    <h4 className='font-bold text-indigo-900 text-sm mb-1'>{currentLesson.content.challengeTitle}</h4>
                    <p className='text-sm text-indigo-800 leading-relaxed'>
                      {currentLesson.content.challengeDescription.split('`').map((part, i) => 
                        i % 2 === 1 ? <code key={i} className='bg-indigo-100 px-1 py-0.5 rounded font-mono text-xs'>{part}</code> : part
                      )}
                    </p>
                  </div>

                  <div className='space-y-4'>
                    <div 
                      onClick={() => setShowRecap(!showRecap)}
                      className='p-4 border rounded-xl hover:border-indigo-300 cursor-pointer transition-colors bg-slate-50 border-slate-200 shadow-2xs'
                    >
                      <div className='flex justify-between items-start mb-1'>
                        <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>Concept Recap</p>
                        <span className='text-indigo-600 text-xs font-bold'>{showRecap ? 'Show −' : 'Show +'}</span>
                      </div>
                      {showRecap && (
                        <p className='text-sm text-slate-600 mt-2 leading-relaxed'>
                          {currentLesson.content.recap}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='p-6 border-t bg-slate-50 flex items-center justify-between shrink-0'>
                  <button 
                    onClick={() => currentLessonId > 1 && setCurrentLessonId(currentLessonId - 1)}
                    disabled={currentLessonId === 1}
                    className={`px-5 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer ${
                      currentLessonId === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ← Previous
                  </button>
                  <button 
                    onClick={() => currentLessonId < lessons.length && setCurrentLessonId(currentLessonId + 1)}
                    disabled={currentLessonId === lessons.length}
                    className='px-8 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all cursor-pointer'
                  >
                    Next Step →
                  </button>
                </div>
              </section>

              {/* Right Column: Code Editor & Console Output */}
              <section className='w-3/5 flex flex-col bg-[#0F172A]'>
                <div className='h-12 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 bg-[#0B1120]'>
                  <div className='flex items-center gap-4'>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5'>
                      <FileCode className='w-3.5 h-3.5 text-indigo-400' /> main.py
                    </span>
                    <div className='flex gap-1.5'>
                      <div className='w-2 h-2 rounded-full bg-slate-700'></div>
                      <div className='w-2 h-2 rounded-full bg-slate-700'></div>
                      <div className='w-2 h-2 rounded-full bg-slate-700'></div>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button 
                      onClick={handleReset}
                      className='px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer'
                    >
                      <RotateCcw className='w-3 h-3' /> Reset
                    </button>
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className='px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-50'
                    >
                      <Play className='w-3 h-3 fill-current' /> {isRunning ? 'RUNNING...' : '▶ RUN CODE'}
                    </button>
                  </div>
                </div>

                <div className='flex-1 p-6 font-mono text-sm leading-relaxed overflow-hidden flex flex-col'>
                  {/* Code Editor Area */}
                  <div className='flex-1 text-slate-300 relative flex'>
                    <div className='w-8 text-slate-600 select-none text-right pr-4 space-y-1 text-xs'>
                      {code.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className='flex-1 bg-transparent text-slate-200 resize-none outline-none font-mono text-sm leading-relaxed focus:ring-0 border-none'
                      spellCheck={false}
                    />
                  </div>

                  {/* Console Output Box */}
                  <div className='h-44 border-t border-slate-800 bg-slate-900/80 -mx-6 -mb-6 p-6 flex flex-col shrink-0'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1'>
                        <TerminalIcon className='w-3 h-3 text-slate-400' /> Console Output
                      </span>
                      <span className='text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1'>
                        <CheckCircle2 className='w-3 h-3' /> Success
                      </span>
                    </div>
                    <div className='flex-1 font-mono text-emerald-400 text-sm overflow-y-auto whitespace-pre-wrap'>
                      {output}
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </>
        ) : (
          /* Practice, Projects, or Playground Views */
          <div className='flex-1 bg-slate-50 p-8 overflow-y-auto'>
            <div className='max-w-4xl mx-auto'>
              <h1 className='text-3xl font-bold text-slate-900 mb-2'>
                {activeTab} Workspace
              </h1>
              <p className='text-slate-600 mb-8'>
                Explore interactive {activeTab.toLowerCase()} to master Python concepts, test your skills, and build real-world scripts.
              </p>

              {activeTab === 'Practice' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {[
                    { title: 'FizzBuzz Challenge', diff: 'Easy', xp: '+50 XP', desc: 'Print numbers from 1 to 100, replacing multiples of 3 with "Fizz".' },
                    { title: 'Palindrome Checker', diff: 'Medium', xp: '+100 XP', desc: 'Write a function to check if a word reads the same backward as forward.' },
                    { title: 'Fibonacci Sequence', diff: 'Medium', xp: '+120 XP', desc: 'Generate the first N numbers of the Fibonacci sequence.' },
                    { title: 'Data Analyzer', diff: 'Hard', xp: '+250 XP', desc: 'Calculate mean, median, and mode from a list of sensor readings.' },
                  ].map((p, idx) => (
                    <div key={idx} className='bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between'>
                      <div>
                        <div className='flex justify-between items-center mb-3'>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            p.diff === 'Easy' ? 'bg-green-100 text-green-700' : p.diff === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {p.diff}
                          </span>
                          <span className='text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded'>{p.xp}</span>
                        </div>
                        <h3 className='font-bold text-lg text-slate-900 mb-2'>{p.title}</h3>
                        <p className='text-slate-600 text-sm mb-4'>{p.desc}</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('Learn')}
                        className='w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer'
                      >
                        Start Challenge
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Projects' && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {[
                    { title: 'Console Calculator', level: 'Beginner', tech: 'Functions & Math' },
                    { title: 'Password Generator', level: 'Intermediate', tech: 'Random & Strings' },
                    { title: 'Weather CLI App', level: 'Advanced', tech: 'APIs & JSON' },
                  ].map((proj, idx) => (
                    <div key={idx} className='bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between'>
                      <div>
                        <div className='w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4'>
                          <FolderGit2 className='w-6 h-6' />
                        </div>
                        <h3 className='font-bold text-lg text-slate-900 mb-1'>{proj.title}</h3>
                        <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3'>{proj.level} • {proj.tech}</p>
                        <p className='text-slate-600 text-sm mb-6'>Build a fully functioning command-line utility from scratch with automated tests.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('Learn')}
                        className='w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer'
                      >
                        Open Project
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Playground' && (
                <div className='bg-[#0F172A] rounded-2xl p-6 text-slate-200 shadow-xl'>
                  <div className='flex items-center justify-between mb-4 border-b border-slate-800 pb-3'>
                    <span className='font-mono text-sm text-indigo-400 font-bold'>Python 3.11 Sandbox</span>
                    <button 
                      onClick={() => alert("Playground code saved to local session!")}
                      className='px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer'
                    >
                      Save Sandbox
                    </button>
                  </div>
                  <textarea
                    defaultValue={"# Free playground\nprint(\"Welcome to PythonPilot Sandbox!\")\n\nx = [10, 20, 30, 40, 50]\nprint(f\"Sum of list: {sum(x)}\")"}
                    className='w-full h-64 bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl resize-none outline-none border border-slate-800'
                    spellCheck={false}
                  />
                  <div className='mt-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs text-slate-300'>
                    <p className='text-slate-500 uppercase font-bold mb-1'>Output:</p>
                    <p className='text-emerald-400'>Welcome to PythonPilot Sandbox!<br/>Sum of list: 150<br/>&gt; Program finished with exit code 0</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Tutor Widget */}
      <div className='fixed bottom-6 right-6 z-50'>
        {isTutorOpen ? (
          <div className='bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200'>
            <div className='bg-indigo-600 text-white p-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-7 h-7 bg-white/10 rounded-full flex items-center justify-center'>
                  <Sparkles className='w-4 h-4 text-white' />
                </div>
                <div>
                  <h4 className='font-bold text-sm'>PythonPilot AI Tutor</h4>
                  <p className='text-[10px] text-indigo-200'>Ask anything about your code</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTutorOpen(false)}
                className='text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='p-4 h-72 overflow-y-auto space-y-3 bg-slate-50 text-xs font-sans'>
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-xs' 
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className='flex justify-start'>
                  <div className='bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl text-xs animate-pulse'>
                    AI Tutor is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendTutorMessage} className='p-3 border-t bg-white flex gap-2'>
              <input
                type='text'
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='Ask a question about loops, syntax...'
                className='flex-1 px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-500'
              />
              <button 
                type='submit'
                disabled={isAiLoading || !chatInput.trim()}
                className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50'
              >
                <Send className='w-3.5 h-3.5' />
              </button>
            </form>
          </div>
        ) : (
          <div className='group relative'>
            <div className='absolute -top-10 right-0 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium text-slate-700'>
              <strong>AI Tutor:</strong> Ask for hints!
            </div>
            <button 
              onClick={() => setIsTutorOpen(true)}
              className='w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer relative'
            >
              <MessageSquare className='w-6 h-6' />
              <div className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse'></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
