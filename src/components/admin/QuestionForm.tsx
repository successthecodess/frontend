'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Eye, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { MarkdownContent } from '@/components/practice/MarkdownContent';

interface QuestionFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function QuestionForm({
  initialData,
  onSubmit,
  isSubmitting,
}: QuestionFormProps) {
  const [units, setUnits] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  const [formData, setFormData] = useState({
    unitId: initialData?.unitId || '',
    topicId: initialData?.topicId || 'none',
    difficulty: initialData?.difficulty || 'EASY',
    type: initialData?.type || 'MULTIPLE_CHOICE',
    questionText: initialData?.questionText || '',
    options: initialData?.options || ['', '', '', ''],
    correctAnswer: initialData?.correctAnswer || '',
    explanation: initialData?.explanation || '',
    approved: initialData?.approved ?? true,
  });

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (formData.unitId) {
      loadTopics(formData.unitId);
    }
  }, [formData.unitId]);

  const loadUnits = async () => {
    try {
      const response = await api.getUnits();
      setUnits(response.data.units || []);
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const loadTopics = async (unitId: string) => {
    try {
      const response = await api.getTopicsByUnit(unitId);
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert('Must have at least 2 options');
      return;
    }
    const newOptions = formData.options.filter((_: string, i: number) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // Process text to handle line breaks for markdown
  const processForMarkdown = (text: string): string => {
    // Convert single newlines to markdown line breaks (two spaces + newline)
    // But preserve double newlines as paragraph breaks
    return text
      .split('\n\n') // Split by paragraph breaks
      .map(paragraph => 
        paragraph
          .split('\n') // Split by single line breaks within paragraph
          .join('  \n') // Add two spaces before newline for markdown line break
      )
      .join('\n\n'); // Rejoin paragraphs
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.unitId) {
      alert('Please select a unit');
      return;
    }
    if (!formData.questionText.trim()) {
      alert('Please enter a question');
      return;
    }
    if (formData.options.some((opt: string) => !opt.trim())) {
      alert('All options must be filled');
      return;
    }
    if (!formData.correctAnswer.trim()) {
      alert('Please enter the correct answer');
      return;
    }
    if (!formData.options.includes(formData.correctAnswer)) {
      alert('Correct answer must match one of the options exactly');
      return;
    }
    if (!formData.explanation.trim()) {
      alert('Please enter an explanation');
      return;
    }

    const submitData = {
      ...formData,
      topicId: formData.topicId === 'none' ? '' : formData.topicId,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Unit Selection */}
            <div>
              <Label>Unit *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) =>
                  setFormData({ ...formData, unitId: value, topicId: 'none' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unitNumber}: {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Selection */}
            <div>
              <Label>Topic (Optional)</Label>
              <Select
                value={formData.topicId}
                onValueChange={(value) =>
                  setFormData({ ...formData, topicId: value })
                }
                disabled={!formData.unitId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific topic</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty and Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Difficulty *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="CODE_ANALYSIS">Code Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Question Content */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Question Content
          </h2>

          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Question Text *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFormatHelp(!showFormatHelp)}
                  className="gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Info className="h-3 w-3" />
                  Formatting Help
                </Button>
              </div>
              
              {showFormatHelp && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900 mb-2">Formatting Tips:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• <strong>Line break:</strong> Press Enter once for a new line</li>
                    <li>• <strong>Paragraph:</strong> Press Enter twice for a new paragraph</li>
                    <li>• <strong>Code block:</strong> ```java{'\n'}your code here{'\n'}```</li>
                    <li>• <strong>Inline code:</strong> `code`</li>
                    <li>• <strong>Bold:</strong> **text**</li>
                    <li>• <strong>Italic:</strong> *text*</li>
                    <li>• <strong>List:</strong> Start line with - or 1.</li>
                  </ul>
                </div>
              )}
              
              <Textarea
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                placeholder={`Enter the question text here...

For code blocks, use:
\`\`\`java
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
\`\`\`

Press Enter for line breaks.`}
                rows={10}
                className="font-mono text-sm whitespace-pre-wrap"
              />
            </div>

            {/* Options */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label>Answer Options *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {formData.options.map((option: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1} (supports multi-line)`}
                        rows={2}
                        className="font-mono text-sm resize-y min-h-[60px]"
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700 self-start mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <Label>Correct Answer *</Label>
              <Select
                value={formData.correctAnswer}
                onValueChange={(value) =>
                  setFormData({ ...formData, correctAnswer: value })
                }
              >
                <SelectTrigger className="h-auto min-h-[40px]">
                  <SelectValue placeholder="Select the correct answer">
                    {formData.correctAnswer && (
                      <span className="whitespace-pre-wrap text-left block py-1">
                        {formData.correctAnswer.length > 50 
                          ? formData.correctAnswer.substring(0, 50) + '...' 
                          : formData.correctAnswer}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {formData.options
                    .filter((opt: string) => opt.trim())
                    .map((option: string, index: number) => (
                      <SelectItem 
                        key={index} 
                        value={option}
                        className="whitespace-pre-wrap"
                      >
                        <span className="block max-w-[400px]">
                          {option.length > 80 ? option.substring(0, 80) + '...' : option}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Selected: {formData.correctAnswer ? 'Option set' : 'None'}
              </p>
            </div>

            {/* Explanation */}
            <div>
              <Label>Explanation *</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder={`Explain why this is the correct answer...

You can use:
- Multiple paragraphs (press Enter twice)
- Line breaks (press Enter once)
- Code examples with \`\`\`java blocks`}
                rows={8}
                className="font-mono text-sm whitespace-pre-wrap"
              />
            </div>
          </div>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Preview
              <span className="ml-2 text-sm font-normal text-gray-500">
                (How students will see it)
              </span>
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {formData.difficulty.toLowerCase()}
                </Badge>
                <Badge variant="secondary">{formData.type}</Badge>
              </div>

              {/* Question Preview */}
              <div className="rounded-lg bg-gray-50 p-4 border">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Question:</p>
                <MarkdownContent content={processForMarkdown(formData.questionText)} />
              </div>

              {/* Options Preview */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Options:</p>
                {formData.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg border-2 p-4 ${
                      option === formData.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                        ${option === formData.correctAnswer 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'}
                      `}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1">
                        <MarkdownContent content={processForMarkdown(option)} />
                      </div>
                      {option === formData.correctAnswer && (
                        <Badge className="bg-green-500 flex-shrink-0">Correct</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation Preview */}
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <p className="text-xs text-blue-600 mb-2 uppercase tracking-wide">Explanation:</p>
                <MarkdownContent content={processForMarkdown(formData.explanation)} />
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.approved}
                  onChange={(e) =>
                    setFormData({ ...formData, approved: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700">
                  Approve immediately (visible to students)
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}