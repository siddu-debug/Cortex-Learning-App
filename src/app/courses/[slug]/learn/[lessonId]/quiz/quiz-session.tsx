'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Award, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/markdown-renderer';

interface Question {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface QuizSessionProps {
  userId: string;
  courseId: string;
  courseSlug: string;
  lessonId: string;
  lessonTitle: string;
  nextLessonId: string | null;
}

export function QuizSession({
  userId,
  courseId,
  courseSlug,
  lessonId,
  lessonTitle,
  nextLessonId,
}: QuizSessionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  
  const [saving, setSaving] = useState(false);

  // Fetch the quiz
  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/lessons/${lessonId}/quiz`);
        if (!res.ok) {
          throw new Error('Failed to generate quiz questions');
        }
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the quiz.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [lessonId]);

  const handleOptionSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || submitted) return;
    
    const isCorrect = selectedOption === questions[currentIndex].correct_answer_index;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    
    setUserAnswers((prev) => [...prev, selectedOption]);
    setSubmitted(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      // Finished the quiz! Save to database
      setFinished(true);
      setSaving(true);
      try {
        const finalScore = score / questions.length;

        // 1. Insert quiz attempt
        await supabase.from('quiz_attempts').insert({
          user_id: userId,
          lesson_id: lessonId,
          score: finalScore,
          answers: userAnswers,
        });

        // 2. Upsert progress (mark lesson complete and save mastery score)
        await supabase.from('progress').upsert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          status: 'complete',
          mastery: finalScore,
          last_visited: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });

        router.refresh();
      } catch (err) {
        console.error('Error saving quiz results:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 text-moss-500 animate-spin mb-4" />
        <p className="text-ink-soft font-medium">Generating your dynamic lesson quiz...</p>
        <p className="text-xs text-ink-faint mt-1">Grounding questions in lesson content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-rose-50 border border-rose-200 rounded-3xl p-8">
        <X className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-display text-lg text-rose-800 font-semibold">Quiz Generation Failed</h3>
        <p className="text-sm text-rose-700 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 font-mono text-xs px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft">No quiz questions generated for this lesson.</p>
        <Link href={`/courses/${courseSlug}/learn/${lessonId}`} className="mt-4 inline-block text-sm text-moss-600 underline">
          Return to Lesson
        </Link>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const scoreColor = percentage >= 80 ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50' : percentage >= 50 ? 'text-gold-700 border-gold-200 bg-gold-50/30' : 'text-rose-600 border-rose-200 bg-rose-50/50';
    
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border shadow-raised text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-violet-400/5 to-transparent rounded-full -z-10" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-tr from-moss-400/5 to-transparent rounded-full -z-10" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-moss-500 via-emerald-500 to-violet-500 text-white flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="font-display text-3xl font-semibold text-gradient-primary">Quiz Completed!</h2>
          <p className="text-sm text-ink-faint mt-1">You have completed the assessment for <span className="font-medium text-ink">{lessonTitle}</span>.</p>

          <div className="my-8 flex justify-center">
            <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-sm ${scoreColor}`}>
              <span className="font-mono text-3xl font-bold">{score}/{questions.length}</span>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider mt-0.5">Correct</span>
            </div>
          </div>

          <h3 className="font-display text-xl text-ink font-semibold">
            {percentage >= 80 ? 'Excellent Mastery!' : percentage >= 60 ? 'Great job!' : 'Keep learning!'}
          </h3>
          <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto">
            {percentage >= 80 
              ? 'You have demonstrating solid understanding of this lesson. You are ready for the next concept!' 
              : percentage >= 60 
                ? 'Good work! Review the explanations for the items you missed to achieve full mastery.' 
                : 'Take another look at the lesson content and chat with the AI tutor to clarify any confusion.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 pt-8 border-t border-border/80">
            <Link
              href={`/courses/${courseSlug}/learn/${lessonId}`}
              className={buttonVariants('outline', 'md', 'w-full sm:w-auto font-mono text-xs rounded-full')}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Lesson
            </Link>

            {nextLessonId ? (
              <Link
                href={`/courses/${courseSlug}/learn/${nextLessonId}`}
                className={buttonVariants('primary', 'md', 'w-full sm:w-auto font-mono text-xs bg-gradient-to-r from-moss-600 to-violet-600 text-white border-0 hover:from-moss-700 hover:to-violet-700 shadow-glow rounded-full')}
              >
                Next Lesson <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/courses/${courseSlug}`}
                className={buttonVariants('secondary', 'md', 'w-full sm:w-auto font-mono text-xs rounded-full')}
              >
                Finish Course <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Top Navigation */}
      <Link 
        href={`/courses/${courseSlug}/learn/${lessonId}`}
        className="inline-flex items-center gap-1 text-xs font-mono text-ink-faint hover:text-ink mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Lesson
      </Link>

      <div className="glass-card rounded-3xl border border-border shadow-raised overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-paper-dim h-1.5">
          <div 
            className="bg-gradient-to-r from-moss-500 to-violet-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs font-semibold tracking-wider text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100 uppercase">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-mono text-xs text-ink-faint">
              Score: {score}
            </span>
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <h2 className="font-display text-xl text-ink font-semibold leading-snug">
              <MarkdownRenderer content={q.question} />
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 mb-8">
            {q.options.map((opt, idx) => {
              const alphabet = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOption === idx;
              
              let optionStyle = 'border-border hover:bg-paper-dim/40 hover:border-border-strong';
              let badgeStyle = 'bg-paper-dim text-ink-soft border-border-strong';

              if (submitted) {
                const isCorrectAnswer = idx === q.correct_answer_index;
                const isUserSelection = idx === selectedOption;

                if (isCorrectAnswer) {
                  optionStyle = 'border-emerald-500 bg-emerald-50/20 text-emerald-800 font-medium ring-2 ring-emerald-500/10';
                  badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                } else if (isUserSelection) {
                  optionStyle = 'border-rose-400 bg-rose-50/20 text-rose-800 ring-2 ring-rose-400/10';
                  badgeStyle = 'bg-rose-500 text-white border-rose-500';
                } else {
                  optionStyle = 'border-border/50 opacity-60 bg-transparent';
                  badgeStyle = 'bg-paper-dim/50 text-ink-faint/60 border-border/30';
                }
              } else if (isSelected) {
                optionStyle = 'border-violet-500 bg-violet-50/30 text-violet-800 font-medium ring-2 ring-violet-500/10';
                badgeStyle = 'bg-violet-600 text-white border-violet-600';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={submitted}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all text-sm ${optionStyle}`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-lg border flex items-center justify-center font-mono text-[11px] font-bold ${badgeStyle}`}>
                    {alphabet}
                  </div>
                  <div className="flex-1 leading-snug">
                    <MarkdownRenderer content={opt} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation / Result */}
          {submitted && (
            <div className="p-5 rounded-2xl border border-border/80 bg-paper-dim/20 mb-8 animate-fadeUp">
              <div className="flex items-center gap-2 mb-3">
                {selectedOption === q.correct_answer_index ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wide">Correct Answer</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-700 uppercase tracking-wide">Incorrect Answer</span>
                  </>
                )}
              </div>
              <div className="text-sm text-ink-soft leading-relaxed">
                <MarkdownRenderer content={q.explanation} />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            {!submitted ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="font-mono text-xs bg-ink hover:bg-ink/90 text-white rounded-full h-11 px-8"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="font-mono text-xs bg-gradient-to-r from-moss-600 to-violet-600 text-white hover:from-moss-700 hover:to-violet-700 border-0 shadow-glow-moss rounded-full h-11 px-8 flex items-center gap-1.5"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Finish Quiz <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
