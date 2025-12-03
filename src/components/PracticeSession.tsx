'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Clock, Brain } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topic: string;
}

interface PracticeSessionProps {
  question: Question;
  onSubmitAnswer: (answer: string, timeSpent: number) => void;
  unitName: string;
  topicName?: string;
}

export default function PracticeSession({
  question,
  onSubmitAnswer,
  unitName,
  topicName
}: PracticeSessionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [question.id]);

  const handleAnswerSelect = (answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSubmitAnswer(selectedAnswer!, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isSubmitted) {
      return selectedAnswer === option
        ? 'border-primary bg-primary/10 ring-2 ring-primary'
        : 'border-border hover:border-primary/50 hover:bg-accent';
    }

    // After submission
    if (option === question.correctAnswer) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-500';
    }
    if (option === selectedAnswer && !isCorrect) {
      return 'border-red-500 bg-red-50 ring-2 ring-red-500';
    }
    return 'border-border opacity-50';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{unitName}</h2>
          {topicName && (
            <p className="text-muted-foreground">{topicName}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(timeElapsed)}
          </Badge>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">
                {question.text}
              </CardTitle>
              <CardDescription>
                Topic: {question.topic}
              </CardDescription>
            </div>
            <Brain className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                  option
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {isSubmitted && option === question.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {isSubmitted && option === selectedAnswer && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Explanation (shown after submission) */}
          {isSubmitted && (
            <Card className={isCorrect ? 'bg-green-50' : 'bg-red-50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Correct!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      Incorrect
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{question.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isSubmitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full"
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full"
                size="lg"
              >
                Next Question →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator (optional) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Session Progress</span>
            <span>Keep going!</span>
          </div>
          <Progress value={33} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}