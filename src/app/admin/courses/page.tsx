'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit, 
  BookOpen,
  Tag,
  Save,
  X
} from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '',
    courseSlug: '',
    requiredGhlTag: '',
    fallbackToFlag: '',
    isActive: true,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert('✅ Course created!');
        setCreating(false);
        resetForm();
        loadCourses();
      }
    } catch (error) {
      alert('Failed to create course');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert('✅ Course updated!');
        setEditing(null);
        resetForm();
        loadCourses();
      }
    } catch (error) {
      alert('Failed to update course');
    }
  };

  const startEdit = (course: any) => {
    setFormData({
      courseName: course.courseName,
      courseSlug: course.courseSlug,
      requiredGhlTag: course.requiredGhlTag || '',
      fallbackToFlag: course.fallbackToFlag || '',
      isActive: course.isActive,
    });
    setEditing(course.id);
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseSlug: '',
      requiredGhlTag: '',
      fallbackToFlag: '',
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Manage course access and requirements</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <Card className="p-6 border-2 border-indigo-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {creating ? 'Create Course' : 'Edit Course'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <Input
                  value={formData.courseName}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                  placeholder="AP Computer Science A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Slug
                </label>
                <Input
                  value={formData.courseSlug}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseSlug: e.target.value }))}
                  placeholder="apcs-a"
                  disabled={!!editing}
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase, hyphens only</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required GHL Tag
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={formData.requiredGhlTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredGhlTag: e.target.value }))}
                  placeholder="course-apcs-a"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Users need this tag to access the course
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fallback Database Flag (Optional)
              </label>
              <select
                value={formData.fallbackToFlag}
                onChange={(e) => setFormData(prev => ({ ...prev, fallbackToFlag: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None</option>
                <option value="hasAccessToQuestionBank">hasAccessToQuestionBank</option>
                <option value="hasAccessToTimedPractice">hasAccessToTimedPractice</option>
                <option value="hasAccessToAnalytics">hasAccessToAnalytics</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                If user doesn't have the GHL tag, check this database flag
              </p>
            </div>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-600">Course is available to students</p>
              </div>
            </label>

            <Button
              onClick={() => editing ? handleUpdate(editing) : handleCreate()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {editing ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </Card>
      )}

      {/* Courses List */}
      <div className="grid gap-4">
        {courses.map((course: any) => (
          <Card key={course.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course.courseName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                    {course.courseSlug}
                  </code>

                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-800 text-sm">
                    <Tag className="h-3 w-3" />
                    {course.requiredGhlTag}
                  </span>

                  {course.fallbackToFlag && (
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                      Fallback: {course.fallbackToFlag}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => startEdit(course)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}