import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AudioPlayer from './components/AudioPlayer';
import VoiceRecorder from './components/VoiceRecorder';
import { TOPICS } from './services/mockData';
import { generateSampleAnswer, evaluateAnswer } from './services/apiHelper';
import { vocabService } from './services/vocabService';
import { customTopicService } from './services/customTopicService';
import { SampleAnswer, Vocabulary, VocabCard, TopicCategory, SentenceAnalysis, Topic, Question, EvaluationResult } from './types';
import type { ExpandedContent } from './services/geminiService';
import { Loader2, Sparkles, ChevronRight, Mic, CheckCircle2, Globe, Languages, Book, X, Volume2, Plus, Brain, GraduationCap, PlayCircle, Trophy, RefreshCw, List, AlignLeft, Split, Timer, StopCircle, PencilLine, AlertCircle, Users, Box, MapPin, CalendarClock, ArrowDownAZ, Calendar, Search, ArrowRight, Clock, Star, Library, Scale, Zap, Activity, MessageCircle, AlertTriangle, Settings, Download, Upload, Trash2, FileJson, LayoutDashboard, MessageSquare, Check, PlusCircle, Wand2, Save, PenTool, Lightbulb, Copy, Send, Radio, Music, GitBranch, Hourglass, ExternalLink, ZoomIn } from 'lucide-react';
import mermaid from 'mermaid';

const parseKeyArgument = (arg: string): Vocabulary => {
  const match = arg.match(/^(.+?)\s*[（(](.+)[)）]$/);
  if (match) {
    return {
      word: match[1].trim(),
      definition: match[2].trim(),
      phonetic: '',
      example: 'Part 3 Strategy Keyword'
    };
  }
  return {
    word: arg,
    definition: 'Context Keyword',
    phonetic: '',
    example: 'Strategic Argument'
  };
};

const ProsodyVisualizer: React.FC<{ markup: string; ipa?: string }> = ({ markup, ipa }) => {
  const parts = markup.split(/(\*\*.*?\*\*)/g);
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm my-4">
      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Music className="w-4 h-4" /> Speaking Guide (Rhythm & Intonation)
      </h4>
      <div className="font-serif text-lg leading-loose text-slate-800 dark:text-slate-200">
        {parts.map((part, i) => {
          const isStressed = part.startsWith('**') && part.endsWith('**');
          const cleanPart = isStressed ? part.slice(2, -2) : part;
          const subParts = cleanPart.split(/([↘↗|‿])/g);
          return (
            <span key={i} className={isStressed ? "font-bold text-indigo-700 dark:text-indigo-400 mx-0.5" : ""}>
              {subParts.map((sub, j) => {
                if (sub === '↘' || sub === '↗') return <span key={`${i}-${j}`} className="text-blue-500 font-bold mx-1 select-none">{sub}</span>;
                if (sub === '|') return <span key={`${i}-${j}`} className="text-slate-300 mx-2 text-xl font-light select-none">|</span>;
                if (sub === '‿') return <span key={`${i}-${j}`} className="text-slate-400 mx-0.5 relative -top-1 select-none">‿</span>;
                return <span key={`${i}-${j}`}>{sub}</span>;
              })}
            </span>
          );
        })}
      </div>
      {ipa && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 font-mono text-sm text-slate-500 dark:text-slate-400 tracking-wide">
          {ipa}
        </div>
      )}
    </div>
  );
};

const MermaidChart: React.FC<{ code: string }> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const editUrl = useMemo(() => {
    try {
        const state = {
            code: code,
            mermaid: { theme: 'default' }
        };
        const json = JSON.stringify(state);
        // Base64 encoding for Mermaid Live Editor (URL safe)
        const base64 = btoa(unescape(encodeURIComponent(json)));
        return `https://mermaid.live/edit#base64:${base64}`;
    } catch (e) {
        console.error("Failed to generate Mermaid link", e);
        return '#';
    }
  }, [code]);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ 
        startOnLoad: false, 
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'base',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis' },
        themeVariables: { fontSize: '16px', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }
      });
      const renderChart = async () => {
        try {
          let sanitizedCode = code.replace(/graph TD(?!\n)/g, 'graph TD\n');
          sanitizedCode = sanitizedCode.replace(/([A-Za-z0-9_]+)\[([^"'][^\]]*)\]/g, '$1["$2"]');
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, sanitizedCode);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) { svgElement.style.height = 'auto'; svgElement.style.maxWidth = '100%'; }
          }
        } catch (error) {
          console.error("Mermaid rendering failed:", error);
          if (containerRef.current) containerRef.current.innerHTML = `<div class="text-red-500 text-xs p-2">Failed to render chart.</div>`;
        }
      };
      renderChart();
    }
  }, [code]);

  return (
    <div className="w-full">
        <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 min-h-[200px]">
            <div ref={containerRef} className="min-w-full flex justify-center" />
        </div>
        <div className="mt-3 flex justify-end">
            <a 
                href={editUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
                <ZoomIn className="w-3.5 h-3.5" />
                🔍 点击全屏查看 / View Full Screen
            </a>
        </div>
    </div>
  );
};

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const tableRows: string[][] = [];
  let inTable = false;
  let tableHeader: string[] = [];

  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      return <span key={i}>{part}</span>;
    });
  };

  const renderedLines = lines.map((line, idx) => {
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeader = line.split('|').filter(c => c.trim()).map(c => c.trim());
        return null;
      }
      if (line.includes('---')) return null;
      const cols = line.split('|').filter(c => c.trim()).map(c => c.trim());
      tableRows.push(cols);
      const nextLine = lines[idx + 1];
      if (!nextLine || !nextLine.trim().startsWith('|')) {
        const currentTableRows = [...tableRows];
        tableRows.length = 0;
        inTable = false;
        return (
          <div key={`table-${idx}`} className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold">
                <tr>{tableHeader.map((h, i) => <th key={i} className="px-6 py-4 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {currentTableRows.map((row, rI) => (
                  <tr key={rI} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {row.map((cell, cI) => <td key={cI} className="px-6 py-4 text-slate-700 dark:text-slate-300 align-top">{renderContent(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    }
    if (line.trim().startsWith('###')) return <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">{renderContent(line.replace(/^###\s*/, ''))}</h3>;
    if (line.trim().startsWith('##')) return <h2 key={idx} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{renderContent(line.replace(/^##\s*/, ''))}</h2>;
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ')) {
       const leadingSpaces = line.search(/\S|$/);
       const indentClass = leadingSpaces >= 2 ? "ml-8" : "ml-4";
       return <li key={idx} className={`${indentClass} list-disc pl-1 mb-1.5 text-slate-700 dark:text-slate-300 leading-relaxed`}>{renderContent(trimmedLine.replace(/^- /, ''))}</li>;
    }
    if (line.trim() === '') return <div key={idx} className="h-2"></div>;
    return <p key={idx} className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">{renderContent(line)}</p>;
  });
  return <div>{renderedLines}</div>;
};

// --- Missing Components Definitions ---

const VocabModal: React.FC<{ vocab: Vocabulary; onClose: () => void }> = ({ vocab, onClose }) => {
  const [isAdded, setIsAdded] = useState(vocabService.hasCard(vocab.word));

  const handleAdd = () => {
    vocabService.addCard(vocab);
    setIsAdded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{vocab.word}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-mono text-sm mt-1">{vocab.phonetic}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Definition</label>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{vocab.definition}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Example</label>
              <p className="text-slate-600 dark:text-slate-400 italic">"{vocab.example}"</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            disabled={isAdded}
            className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isAdded 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30'
            }`}
          >
            {isAdded ? <><CheckCircle2 className="w-5 h-5" /> Added to Deck</> : <><Plus className="w-5 h-5" /> Add to Vocabulary Deck</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const TopicListPage: React.FC = () => {
  const [activePart, setActivePart] = useState('part1');
  const [search, setSearch] = useState('');
  const allTopics = useMemo(() => [...TOPICS, ...customTopicService.getTopics()], []);

  const filteredTopics = allTopics.filter(t => 
    t.part === activePart && 
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Practice Topics</h1>
          <p className="text-slate-500 dark:text-slate-400">Select a topic to start your IELTS speaking practice.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['part1', 'part2'].map(part => (
          <button
            key={part}
            onClick={() => setActivePart(part)}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activePart === part 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {part === 'part1' ? 'Part 1: Interview' : 'Part 2 & 3: Long Turn'}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map(topic => (
          <Link to={`/topic/${topic.id}`} key={topic.id} className="group block p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                topic.category === 'People' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                topic.category === 'Places' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                topic.category === 'Events' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {topic.category}
              </span>
              {topic.status === 'forecast' && <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><Zap className="w-3 h-3" /> New</span>}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{topic.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{topic.description}</p>
            <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
              Start Practice <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const QuestionExpanderPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [part, setPart] = useState('part1');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExpandedContent | null>(null);

  const handleGenerate = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    try {
      const data = await generateSampleAnswer(question, part);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert('Generation failed. Please check your API key or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Question Expander</h1>
        <p className="text-slate-500 dark:text-slate-400">Turn any simple question into a full learning resource with sample answers and vocabulary.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid gap-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter an IELTS question here (e.g., 'Do you like reading?')"
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
          />
          <div className="flex gap-4">
            <select
              value={part}
              onChange={(e) => setPart(e.target.value)}
              className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="part1">Part 1 (Short)</option>
              <option value="part2">Part 2 (Long)</option>
              <option value="part3">Part 3 (Discussion)</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !question.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Expand with AI
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
             <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Examiner's Logic</h3>
                <p className="text-slate-800 dark:text-slate-200 italic">{result.thinking_logic}</p>
             </div>
             
             <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Arguments</h3>
                <div className="flex flex-wrap gap-2">
                   {result.key_arguments.map((arg, i) => (
                     <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-sm">{arg}</span>
                   ))}
                </div>
             </div>

             <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
               <h3 className="text-xl font-bold">Sample Answer</h3>
               <p className="whitespace-pre-wrap leading-relaxed">{result.english}</p>
               {result.prosody_markup && <ProsodyVisualizer markup={result.prosody_markup} ipa={result.ipa} />}
             </div>

             <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
               {result.vocabularies.map((vocab, idx) => (
                 <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{vocab.word}</span>
                      <button onClick={() => vocabService.addCard(vocab)} className="text-slate-400 hover:text-green-500"><PlusCircle className="w-4 h-4" /></button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{vocab.phonetic}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{vocab.definition}</p>
                    <p className="text-xs text-slate-500 italic">"{vocab.example}"</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CriteriaPage: React.FC = () => {
  const criteria = [
    { title: "Fluency & Coherence", desc: "Speak at length without noticeable effort or loss of coherence. Use a range of connectives and discourse markers.", icon: <Activity className="w-6 h-6 text-blue-500" /> },
    { title: "Lexical Resource", desc: "Use a wide range of vocabulary with precision. Use less common and idiomatic vocabulary skillfully.", icon: <Book className="w-6 h-6 text-purple-500" /> },
    { title: "Grammatical Range", desc: "Use a wide range of structures flexibly. Produce a majority of error-free sentences.", icon: <Scale className="w-6 h-6 text-emerald-500" /> },
    { title: "Pronunciation", desc: "Use a full range of pronunciation features. Sustain flexible use of features throughout.", icon: <Mic className="w-6 h-6 text-amber-500" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Scoring Criteria</h1>
        <p className="text-slate-500 dark:text-slate-400">Understanding how you are assessed is key to achieving Band 7+.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {criteria.map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {c.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{c.title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const VocabularyPage: React.FC = () => {
  const [deck, setDeck] = useState<VocabCard[]>(vocabService.getDeck());
  const [mode, setMode] = useState<'list' | 'review'>('list');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  useEffect(() => {
    setDeck(vocabService.getDeck());
  }, [mode]);

  const dueCards = useMemo(() => vocabService.getDueCards(), [deck]);

  const handleReviewResult = (correct: boolean) => {
    const card = dueCards[reviewIndex];
    vocabService.processReview(card.id, correct);
    if (reviewIndex < dueCards.length - 1) {
      setReviewIndex(prev => prev + 1);
      setShowDefinition(false);
    } else {
      alert("Review session complete!");
      setMode('list');
    }
  };

  if (mode === 'review' && dueCards.length > 0) {
    const currentCard = dueCards[reviewIndex];
    return (
      <div className="max-w-md mx-auto py-10 h-[calc(100vh-100px)] flex flex-col justify-center">
        <div className="text-center mb-6">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Reviewing {reviewIndex + 1} / {dueCards.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center p-8 text-center cursor-pointer" onClick={() => setShowDefinition(true)}>
           <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{currentCard.word}</h2>
           <p className="text-blue-500 font-mono mb-8">{currentCard.phonetic}</p>
           
           {showDefinition ? (
             <div className="animate-in fade-in slide-in-from-bottom-2">
               <p className="text-xl text-slate-700 dark:text-slate-300 font-medium mb-4">{currentCard.definition}</p>
               <p className="text-slate-500 italic">"{currentCard.example}"</p>
             </div>
           ) : (
             <p className="text-slate-400 text-sm mt-8">Tap to show definition</p>
           )}
        </div>
        
        {showDefinition && (
          <div className="flex gap-4 mt-8">
            <button onClick={() => handleReviewResult(false)} className="flex-1 py-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors">Forgot</button>
            <button onClick={() => handleReviewResult(true)} className="flex-1 py-4 bg-green-100 text-green-600 rounded-xl font-bold hover:bg-green-200 transition-colors">Got it</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Vocabulary Deck</h1>
          <p className="text-slate-500 dark:text-slate-400">Master high-level vocabulary with Spaced Repetition.</p>
        </div>
        {dueCards.length > 0 && (
          <button onClick={() => { setReviewIndex(0); setShowDefinition(false); setMode('review'); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
            <RefreshCw className="w-5 h-5" /> Review {dueCards.length} Cards
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {deck.map(card => (
          <div key={card.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors group relative">
            <button 
              onClick={(e) => { e.stopPropagation(); vocabService.removeCard(card.id); setDeck(vocabService.getDeck()); }}
              className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{card.word}</h3>
            <p className="text-xs text-blue-500 font-mono mb-3">{card.phonetic}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2" title={card.definition}>{card.definition}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
               <span>Level {Math.min(5, card.interval)}</span>
               <span>Streak: {card.streak}</span>
            </div>
          </div>
        ))}
        {deck.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Your deck is empty. Start practicing topics to add words!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all your vocabulary and progress.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your app preferences and data.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Data Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Control your local data storage.</p>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={handleClearData} className="px-6 py-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Clear All Data
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 pt-8">
        <p>IELTS Prep.AI v1.0.0</p>
        <p className="mt-2">Built with React & Gemini API</p>
      </div>
    </div>
  );
};

// --- Practice Page Logic ---

type Stage = 'idle' | 'prep' | 'recording' | 'editing' | 'evaluating' | 'results';

const PracticePage: React.FC = () => {
  const { id } = useParams();
  const allTopics = useMemo(() => [...TOPICS, ...customTopicService.getTopics()], []);
  const topic = allTopics.find(t => t.id === Number(id));
  
  // Navigation & Data State
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<SampleAnswer | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<AudioBuffer | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);

  // Workflow State
  const [stage, setStage] = useState<Stage>('idle');
  const [userAnswerText, setUserAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [prepTimeLeft, setPrepTimeLeft] = useState(60); // 1 minute for Part 2
  
  // Refs
  const prepTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset state on topic change
    setCurrentQIdx(0);
    resetWorkflow();
  }, [id]);

  useEffect(() => {
    // Update sample answer when question changes
    if (topic?.questions && topic.questions[currentQIdx]) {
      const q = topic.questions[currentQIdx];
      setCurrentAnswer(q.sample_answer || null);
      
      // Auto-enter prep mode if it's Part 2 Cue Card (Question 1)
      if (topic.part === 'part2' && currentQIdx === 0) {
        startPrep();
      } else {
        setStage('idle');
      }
    }
  }, [topic, currentQIdx]);

  useEffect(() => {
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, []);

  if (!topic || !topic.questions || topic.questions.length === 0) return <div>Topic not found</div>;

  const currentQuestion = topic.questions[currentQIdx];
  const isLastQuestion = currentQIdx === topic.questions.length - 1;
  const isPart2CueCard = topic.part === 'part2' && currentQIdx === 0;

  const resetWorkflow = () => {
    setStage('idle');
    setUserAnswerText('');
    setEvaluation(null);
    setGeneratedAudio(null);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
  };

  const startPrep = () => {
    setStage('prep');
    setPrepTimeLeft(60);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    
    prepTimerRef.current = window.setInterval(() => {
      setPrepTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current!);
          return 0; // Timer ends, user can click start
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipPrep = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setStage('recording');
  };

  const handleRecordingComplete = async (blob: Blob, transcript: string) => {
    setUserAnswerText(transcript);
    setStage('editing');
    try {
        // Transcription refining service available via API
        // const refined = await transcribeAudio(blob);
        // if (refined) setUserAnswerText(refined);
    } catch(e) {
        console.error("Transcription refine failed", e);
    }
  };

  const handleSubmitAnswer = async () => {
    const answerToSubmit = userAnswerText.trim();
    if (!answerToSubmit) return;

    setStage('evaluating');
    try {
      const evalResult = await evaluateAnswer(currentQuestion.content, answerToSubmit);
      setEvaluation(evalResult);
      
      // Auto-generate sample answer if missing
      if (!currentAnswer) {
         const genResult = await generateSampleAnswer(currentQuestion.content, topic.part);
         const newAnswer: SampleAnswer = {
            id: Date.now(),
            question_id: currentQuestion.id,
            english_text: genResult.english,
            chinese_translation: genResult.chinese,
            vocabularies: genResult.vocabularies,
            sentences: genResult.sentences
         };
         setCurrentAnswer(newAnswer);
      }
      setStage('results');
    } catch (e) {
      console.error(e);
      alert("Evaluation failed. Please try again.");
      setStage('editing');
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      alert("Practice completed!");
      return;
    }
    setCurrentQIdx(prev => prev + 1);
  };

  const handlePlayAudio = async (text: string) => {
    if (generatedAudio) return;
    setIsAudioLoading(true);
    try {
      // Speech generation not available in this version
      console.warn('Speech generation not implemented');
      setIsAudioLoading(false);
    } catch (e) { console.error(e); } finally { setIsAudioLoading(false); }
  };

  // --- Render Steps ---

  const renderStepper = () => {
    const steps = [
      { id: 'prep', label: 'Preparation', icon: <Hourglass className="w-4 h-4" /> },
      { id: 'recording', label: 'Speak', icon: <Mic className="w-4 h-4" /> },
      { id: 'editing', label: 'Review', icon: <PenTool className="w-4 h-4" /> },
      { id: 'results', label: 'Analysis', icon: <Brain className="w-4 h-4" /> },
    ];

    let activeIdx = 0;
    if (stage === 'recording') activeIdx = 1;
    if (stage === 'editing' || stage === 'evaluating') activeIdx = 2;
    if (stage === 'results') activeIdx = 3;
    if (stage === 'idle' && !isPart2CueCard) activeIdx = 1;

    return (
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((s, i) => (
          <div key={s.id} className={`flex flex-col items-center gap-2 relative z-10 ${i <= activeIdx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i <= activeIdx 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none scale-110' 
                : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}>
              {i < activeIdx ? <Check className="w-4 h-4" /> : (i === activeIdx ? s.icon : i + 1)}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
            {i < steps.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${i < activeIdx ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} style={{ width: 'calc(100% + 2rem)', left: '50%' }}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="mb-6">
         <Link to="/" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-4 font-bold text-sm">
           <ChevronRight className="w-4 h-4 rotate-180" /> Back to Topics
         </Link>
         <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white line-clamp-1">{topic.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Part {topic.part === 'part1' ? '1: Interview' : '2 & 3: Long Turn'}</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
               Question {currentQIdx + 1} / {topic.questions.length}
            </span>
         </div>
         <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${((currentQIdx + 1) / topic.questions.length) * 100}%` }}></div>
         </div>
       </div>

       {renderStepper()}

       <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8 relative transition-all duration-500">
          
          {stage === 'prep' && isPart2CueCard && (
            <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in">
                <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center mb-6 relative">
                    <span className="text-3xl font-mono font-bold">{prepTimeLeft}s</span>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" style={{ animationDuration: '60s' }}></div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Preparation Time</h3>
                <p className="text-slate-300 mb-8 max-w-md">Take a minute to read the question and write down some notes. The recording will start automatically or you can start now.</p>
                <button onClick={skipPrep} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-transform active:scale-95 flex items-center gap-2">
                    <Mic className="w-5 h-5" /> Start Speaking Now
                </button>
            </div>
          )}

          <div className="p-8">
             <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-8">
               {currentQuestion.content}
             </h2>

             {(stage === 'idle' || stage === 'recording' || stage === 'prep') && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                          <Mic className="w-4 h-4" /> Your Response
                        </p>
                        {isPart2CueCard && <span className="text-xs font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">2 Min Limit</span>}
                      </div>
                      
                      <VoiceRecorder 
                        onTranscriptUpdate={(text) => setUserAnswerText(text)}
                        onRecordingComplete={handleRecordingComplete}
                        timeLimit={isPart2CueCard ? 120 : undefined} 
                        autoStart={stage === 'recording'}
                      />
                   </div>
                   
                   {stage === 'idle' && !isPart2CueCard && (
                       <div className="text-center text-slate-400 text-sm italic">
                           Click the microphone above to start recording.
                       </div>
                   )}
                </div>
             )}

             {stage === 'editing' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                          <PenTool className="w-4 h-4" /> Review Transcript
                        </p>
                        <button onClick={() => setStage('recording')} className="text-xs font-bold text-blue-600 hover:underline">Retake Recording</button>
                    </div>
                    <textarea 
                        value={userAnswerText}
                        onChange={(e) => setUserAnswerText(e.target.value)}
                        className="w-full h-48 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-slate-900 dark:text-white text-lg leading-relaxed"
                        placeholder="Waiting for transcript..."
                    />
                    <button 
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswerText.trim()}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Sparkles className="w-5 h-5" /> Analyze My Answer
                    </button>
                </div>
             )}

             {stage === 'evaluating' && (
                 <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in">
                     <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing your response...</h3>
                     <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Our AI examiner is evaluating your fluency, vocabulary, grammar, and pronunciation.</p>
                 </div>
             )}

             {stage === 'results' && evaluation && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  
                  {evaluation.logic_analysis && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GitBranch className="w-5 h-5" />
                                <span className="font-bold">Logic X-Ray</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-purple-500">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🩺</span>
                                    <div>
                                        <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-1">Coach's Diagnosis</h4>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{evaluation.logic_analysis.logic_xray}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <MermaidChart code={evaluation.logic_analysis.mermaid_code} />
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                                    <h4 className="text-blue-700 dark:text-blue-300 font-bold mb-2 text-sm">Supporting Reasons</h4>
                                    <ul className="space-y-2">{evaluation.logic_analysis.argument_structure.Supporting_Reasons.map((r, i) => <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"><Check className="w-4 h-4 text-blue-500 shrink-0" />{r}</li>)}</ul>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl">
                                    <h4 className="text-emerald-700 dark:text-emerald-300 font-bold mb-2 text-sm">Evidence</h4>
                                    <ul className="space-y-2">{evaluation.logic_analysis.argument_structure.Examples.map((e, i) => <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"><Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />{e}</li>)}</ul>
                                </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Actionable Advice</h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">{evaluation.logic_analysis.next_step_advice}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                           <GraduationCap className="w-5 h-5" /> Assessment Report
                        </h3>
                        <div className="px-4 py-1 bg-white dark:bg-slate-900 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm">
                           <span className="text-sm font-bold text-slate-500 dark:text-slate-400 mr-2">Band</span>
                           <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{evaluation.score}</span>
                        </div>
                     </div>
                     <div className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                       <SimpleMarkdownRenderer text={evaluation.feedback} />
                     </div>
                     {evaluation.prosody_markup && <ProsodyVisualizer markup={evaluation.prosody_markup} ipa={evaluation.ipa} />}
                     <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl mt-4">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1 block">Better Version</span>
                        <p className="text-indigo-900 dark:text-indigo-200 italic">"{evaluation.better_version}"</p>
                     </div>
                  </div>

                  {currentAnswer && (
                     <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> Model Answer</h3>
                           <button onClick={() => handlePlayAudio(currentAnswer.english_text)} disabled={isAudioLoading} className="text-blue-600 dark:text-blue-400 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                               {isAudioLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                           </button>
                        </div>
                        {generatedAudio && <AudioPlayer audioBuffer={generatedAudio} label="Model Audio" />}
                        <div className="prose prose-slate dark:prose-invert max-w-none mb-6 text-sm">
                           <p className="whitespace-pre-wrap">{currentAnswer.english_text}</p>
                        </div>
                        
                        {(currentQuestion.thinking_logic || currentQuestion.key_arguments) && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-800/50 mb-6">
                                <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-2 flex items-center gap-2"><Brain className="w-4 h-4" /> Examiner's Logic</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{currentQuestion.thinking_logic}</p>
                                <div className="flex flex-wrap gap-2">
                                    {currentQuestion.key_arguments?.map((arg, i) => (
                                        <button key={i} onClick={() => { const v = parseKeyArgument(arg); if(!vocabService.hasCard(v.word)) vocabService.addCard(v); }} className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border rounded hover:border-amber-400 transition-colors">{arg}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentAnswer.vocabularies && (
                           <div className="grid sm:grid-cols-2 gap-3">
                              {currentAnswer.vocabularies.map((vocab, idx) => (
                                 <button key={idx} onClick={() => setSelectedVocab(vocab)} className="text-left px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                                    <span className="font-bold text-slate-900 dark:text-white block text-sm">{vocab.word}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">{vocab.definition}</span>
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  )}

                  <div className="pt-6 flex justify-end">
                     <button onClick={handleNextQuestion} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                        {isLastQuestion ? 'Finish Practice' : 'Next Question'} <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
             )}
          </div>
       </div>

       {selectedVocab && <VocabModal vocab={selectedVocab} onClose={() => setSelectedVocab(null)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TopicListPage />} />
          <Route path="/topic/:id" element={<PracticePage />} />
          <Route path="/expander" element={<QuestionExpanderPage />} />
          <Route path="/criteria" element={<CriteriaPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/progress" element={<div className="p-10 text-center font-bold text-slate-400">Progress Tracking Coming Soon</div>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;