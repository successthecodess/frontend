'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ['.csv', '.xlsx', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      
      if (!validTypes.includes(`.${fileExtension}`) && !validTypes.includes(selectedFile.type)) {
        setError('Please upload a CSV or Excel file (.csv or .xlsx)');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    
    try {
      const response = await api.bulkUploadQuestions(file);
      setUploadResult(response.data);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please check the file format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
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

    const sampleRows = [
      [
        '1',
        'Primitive Types',
        'What is the output of: int x = 5; System.out.println(x);',
        '5',
        'x',
        '0',
        'Error',
        '5',
        'The variable x stores the value 5, which is printed to the console.',
        'EASY',
        'MULTIPLE_CHOICE',
      ],
      [
        '2',
        'Using Objects',
        'Which method is used to compare two String objects for equality?',
        'equals()',
        '==',
        'compareTo()',
        'compare()',
        'equals()',
        'The equals() method compares the content of two String objects.',
        'MEDIUM',
        'MULTIPLE_CHOICE',
      ],
    ];

    const csv = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ap-cs-questions-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Questions</h1>
        <p className="mt-2 text-gray-600">
          Upload multiple questions at once using a CSV or Excel file
        </p>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">File Format Requirements</h3>
            <ul className="space-y-1.5 text-sm text-blue-700">
              <li>• <strong>File Type:</strong> CSV or Excel (.xlsx) - Maximum 10MB</li>
              <li>• <strong>Required Columns:</strong> Unit Number, Topic Name, Question Text, Options (1-4), Correct Answer, Explanation, Difficulty, Type</li>
              <li>• <strong>Difficulty Values:</strong> EASY, MEDIUM, HARD, or EXPERT</li>
              <li>• <strong>Type Values:</strong> MULTIPLE_CHOICE, TRUE_FALSE, or CODE_ANALYSIS</li>
              <li>• <strong>Important:</strong> Correct Answer must match one of the options exactly (case-sensitive)</li>
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
              Get a sample CSV file with the correct format and example questions
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Upload Error</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </Card>
      )}

      {/* Upload Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:border-gray-400 hover:bg-gray-100">
            <FileSpreadsheet className={`h-12 w-12 ${file ? 'text-indigo-600' : 'text-gray-400'}`} />
            <p className="mt-4 text-sm font-semibold text-gray-900">
              {file ? file.name : 'Choose a file to upload'}
            </p>
            {file ? (
              <p className="mt-1 text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB • {file.type || 'CSV/Excel'}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-600">
                CSV or Excel files up to 10MB
              </p>
            )}
            <label
              htmlFor="file-upload"
              className="mt-4 cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
            >
              Browse Files
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
          </div>

          {file && (
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => {
                  setFile(null);
                  setError(null);
                  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                variant="outline"
              >
                Cancel
              </Button>
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
          <h3 className="mb-4 text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Upload Complete
          </h3>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-3xl font-bold text-green-600">
                {uploadResult.success}
              </p>
              <p className="text-sm text-gray-600 mt-1">Successfully Created</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-3xl font-bold text-red-600">
                {uploadResult.failed}
              </p>
              <p className="text-sm text-gray-600 mt-1">Failed</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">
                {uploadResult.success + uploadResult.failed}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Processed</p>
            </div>
          </div>

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Errors Found ({uploadResult.errors.length})
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uploadResult.errors.map((error: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm"
                  >
                    <p className="font-medium text-red-900">Row {error.row}</p>
                    <p className="text-red-700 mt-1">{error.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadResult.success > 0 && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => window.location.href = '/admin/questions'}
                variant="outline"
              >
                View All Questions
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
