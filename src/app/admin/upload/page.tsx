'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.bulkUploadQuestions(file);
      setUploadResult(response.data);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please check the file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      'Unit Number',
      'Topic Name',
      'Question Text',
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4',
      'Correct Answer',
      'Explanation',
      'Difficulty',
      'Type',
    ];

    const sampleRow = [
      '1',
      'Variables and Data Types',
      'What is the output of: int x = 5; System.out.println(x);',
      '5',
      'x',
      '0',
      'Error',
      '5',
      'The variable x stores the value 5, which is printed.',
      'EASY',
      'MULTIPLE_CHOICE',
    ];

    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-template.csv';
    a.click();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Questions</h1>
        <p className="mt-2 text-gray-600">
          Upload multiple questions at once using a CSV or Excel file
        </p>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">File Format Requirements</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• File must be CSV or Excel (.xlsx)</li>
              <li>• Include headers: Unit Number, Topic Name, Question Text, Options, Correct Answer, Explanation, Difficulty, Type</li>
              <li>• Difficulty: EASY, MEDIUM, HARD, or EXPERT</li>
              <li>• Type: MULTIPLE_CHOICE, TRUE_FALSE, or CODE_ANALYSIS</li>
              <li>• Correct Answer must match one of the options exactly</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Template Download */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Download Template</h3>
            <p className="mt-1 text-sm text-gray-600">
              Get a sample CSV file with the correct format
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </Card>

      {/* Upload Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
            <FileSpreadsheet className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-semibold text-gray-900">
              {file ? file.name : 'Choose a file to upload'}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              CSV or Excel files up to 10MB
            </p>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="mt-4"
              id="file-upload"
            />
          </div>

          {file && (
            <div className="flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Questions'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Upload Results
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {uploadResult.success}
              </p>
              <p className="text-sm text-gray-600">Successfully Created</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-600">
                {uploadResult.failed}
              </p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {uploadResult.success + uploadResult.failed}
              </p>
              <p className="text-sm text-gray-600">Total Processed</p>
            </div>
          </div>

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 font-semibold text-gray-900">Errors:</h4>
              <div className="space-y-2">
                {uploadResult.errors.map((error: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    Row {error.row}: {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
