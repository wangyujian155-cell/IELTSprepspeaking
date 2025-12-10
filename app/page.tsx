'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '@/components/Layout';
import AudioPlayer from '@/components/AudioPlayer';
import VoiceRecorder from '@/components/VoiceRecorder';
import { TOPICS } from '@/services/mockData';
import { ExpandedContent } from '@/services/geminiService';
import { vocabService } from '@/services/vocabService';
import { customTopicService } from '@/services/customTopicService';
import { SampleAnswer, Vocabulary, VocabCard, TopicCategory, SentenceAnalysis, Topic, Question, EvaluationResult } from '@/types';
import { Loader2, Sparkles, ChevronRight, Mic, CheckCircle2, Globe, Languages, Book, X, Volume2, Plus, Brain, GraduationCap, PlayCircle, Trophy, RefreshCw, List, AlignLeft, Split, Timer, StopCircle, PencilLine, AlertCircle, Users, Box, MapPin, CalendarClock, ArrowDownAZ, Calendar, Search, ArrowRight, Clock, Star, Library, Scale, Zap, Activity, MessageCircle, AlertTriangle, Settings, Download, Upload, Trash2, FileJson, LayoutDashboard, MessageSquare, Check, PlusCircle, Wand2, Save, PenTool, Lightbulb, Copy, Send, Radio, Music, GitBranch, Hourglass, ExternalLink, ZoomIn } from 'lucide-react';
import mermaid from 'mermaid';
import App from '@/App';

export default function Home() {
  return <App />;
}
