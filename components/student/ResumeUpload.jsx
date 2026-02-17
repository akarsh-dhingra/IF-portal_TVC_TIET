'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, FileCheck, Loader2 } from 'lucide-react';

export default function ResumeUpload({ onUploadSuccess, existingResume }) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setIsUploading(true);
      const response = await fetch('/api/student/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload resume');
      }

      toast({
        title: 'Success',
        description: 'Resume uploaded successfully',
      });

      if (onUploadSuccess) {
        onUploadSuccess(data.resumePath);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="relative"
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <span className="flex items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {existingResume ? 'Update Resume' : 'Upload Resume'}
                </>
              )}
            </span>
          </Button>
        </div>

        {existingResume && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileCheck className="w-4 h-4 text-green-500" />
            <span>Resume uploaded</span>
            <a
              href={existingResume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View
            </a>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Accepted file type: .pdf (max 5MB)
      </p>
    </div>
  );
}
