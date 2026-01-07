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
import { X, Plus, Eye } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    unitId: initialData?.unitId || '',
    topicId: initialData?.topicId || 'none', // Changed to 'none'
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
      setTopics([]); // Set empty array on error
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

    // Convert 'none' to empty string before submitting
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
              <Label>Question Text *</Label>
              <Textarea
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                placeholder="Enter the question. Use ```java for code blocks..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-600">
                Tip: Use markdown for formatting. Code blocks: ```java your code here ```
              </p>
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
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700"
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
                <SelectTrigger>
                  <SelectValue placeholder="Select the correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {formData.options
                    .filter((opt: string) => opt.trim())
                    .map((option: string, index: number) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Explanation */}
            <div>
              <Label>Explanation *</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Explain why this is the correct answer..."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-600">
                Provide a detailed explanation to help students learn
              </p>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Preview</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {formData.difficulty.toLowerCase()}
                </Badge>
                <Badge variant="secondary">{formData.type}</Badge>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <MarkdownContent content={formData.questionText} />
              </div>

              <div className="space-y-2">
                {formData.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg border-2 p-4 ${
                      option === formData.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <MarkdownContent content={option} />
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="mb-2 font-semibold text-blue-900">Explanation:</p>
                <MarkdownContent content={formData.explanation} />
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
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