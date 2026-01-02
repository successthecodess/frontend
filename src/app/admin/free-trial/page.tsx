'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Search, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminFreeTrialPage() {
  const [freeTrialQuestions, setFreeTrialQuestions] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFreeTrialQuestions();
    loadAvailableQuestions();
  }, []);

  const loadFreeTrialQuestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/free-trial/questions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      
      // Create array of 10 slots
      const slots = Array(10).fill(null).map((_, index) => {
        const question = data.find((q: any) => q.orderIndex === index + 1);
        return {
          orderIndex: index + 1,
          question: question?.question || null,
          isEmpty: !question,
        };
      });

      setFreeTrialQuestions(slots);
    } catch (error) {
      console.error('Failed to load free trial questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuestions = async (unitId?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const url = unitId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/free-trial/available-questions?unitId=${unitId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/free-trial/available-questions`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setAvailableQuestions(data);
    } catch (error) {
      console.error('Failed to load available questions:', error);
    }
  };

  const handleSetQuestion = async (questionId: string, orderIndex: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/free-trial/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionId, orderIndex }),
        }
      );

      if (response.ok) {
        alert(`✅ Question set for slot ${orderIndex}`);
        setSelectedSlot(null);
        loadFreeTrialQuestions();
      } else {
        const data = await response.json();
        alert(`Failed to set question: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to set question');
    }
  };

  const handleRemoveQuestion = async (orderIndex: number) => {
    if (!confirm(`Remove question from slot ${orderIndex}?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/free-trial/questions/${orderIndex}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert(`✅ Question removed from slot ${orderIndex}`);
        loadFreeTrialQuestions();
      }
    } catch (error) {
      alert('Failed to remove question');
    }
  };

  const filteredQuestions = availableQuestions.filter(q => {
    const matchesSearch = !searchQuery || 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.unit?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUnit = !filterUnit || q.unitId === filterUnit;

    return matchesSearch && matchesUnit;
  });

  const assignedQuestionIds = freeTrialQuestions
    .filter(slot => !slot.isEmpty)
    .map(slot => slot.question.id);

  const filledSlots = freeTrialQuestions.filter(slot => !slot.isEmpty).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Gift className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Free Trial Questions</h1>
        </div>
        <p className="text-gray-600">
          Select 10 questions for the free trial diagnostic quiz. These questions will be shown in order to all new users.
        </p>
      </div>

      {/* Status Card */}
      <Card className={`p-6 ${filledSlots === 10 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-4">
          {filledSlots === 10 ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          )}
          <div className="flex-1">
            <h3 className={`font-semibold ${filledSlots === 10 ? 'text-green-900' : 'text-yellow-900'}`}>
              {filledSlots === 10 ? 'Free Trial Ready!' : 'Free Trial Incomplete'}
            </h3>
            <p className={`text-sm ${filledSlots === 10 ? 'text-green-700' : 'text-yellow-700'}`}>
              {filledSlots} of 10 questions configured
            </p>
          </div>
        </div>
      </Card>

      {/* Question Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {freeTrialQuestions.map((slot) => (
          <Card key={slot.orderIndex} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-indigo-600">{slot.orderIndex}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {slot.isEmpty ? (
                    <p className="text-gray-500 text-sm">No question selected</p>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Unit {slot.question.unit?.unitNumber}
                        </Badge>
                        <Badge className="text-xs">
                          {slot.question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {slot.question.questionText}
                      </p>
                      {slot.question.topic && (
                        <p className="text-xs text-gray-600 mt-1">
                          {slot.question.topic.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {slot.isEmpty ? (
                  <Button
                    size="sm"
                    onClick={() => setSelectedSlot(slot.orderIndex)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setSelectedSlot(slot.orderIndex)}
                      variant="outline"
                    >
                      Change
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRemoveQuestion(slot.orderIndex)}
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Question Selection Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Select Question for Slot {selectedSlot}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSlot(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterUnit}
                  onChange={(e) => {
                    setFilterUnit(e.target.value);
                    loadAvailableQuestions(e.target.value);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Units</option>
                  {Array.from(new Set(availableQuestions.map(q => q.unit?.id))).map((unitId: any) => {
                    const unit = availableQuestions.find(q => q.unit?.id === unitId)?.unit;
                    return (
                      <option key={unitId} value={unitId}>
                        Unit {unit?.unitNumber}: {unit?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No questions found
                  </p>
                ) : (
                  filteredQuestions.map((question) => {
                    const isAlreadyAssigned = assignedQuestionIds.includes(question.id);
                    
                    return (
                      <Card
                        key={question.id}
                        className={`p-4 ${isAlreadyAssigned ? 'opacity-50 bg-gray-50' : 'hover:shadow-md cursor-pointer'}`}
                        onClick={() => !isAlreadyAssigned && handleSetQuestion(question.id, selectedSlot)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Unit {question.unit?.unitNumber}
                              </Badge>
                              <Badge className="text-xs">
                                {question.difficulty}
                              </Badge>
                              {isAlreadyAssigned && (
                                <Badge variant="secondary" className="text-xs">
                                  Already Used
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 mb-1">
                              {question.questionText}
                            </p>
                            {question.topic && (
                              <p className="text-sm text-gray-600">
                                Topic: {question.topic.name}
                              </p>
                            )}
                          </div>
                          {!isAlreadyAssigned && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetQuestion(question.id, selectedSlot);
                              }}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}