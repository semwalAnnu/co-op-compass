'use client';

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Card } from "@/types/User";

interface UrlInputProps {
  onAddJob: (jobData: {
    role: string;
    company: string;
    url: string;
    location?: string;
    deadline?: string;
    status: Card['status'];
  }) => void;
}

export default function UrlInput({ onAddJob }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      // First, try to extract job data from the URL
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      let jobData;
      if (response.ok) {
        const extracted = await response.json();
        jobData = {
          role: extracted.jobTitle || 'Unknown Position',
          company: extracted.company || 'Unknown Company',
          url: url.trim(),
          status: 'TO_APPLY' as const,
        };
      } else {
        // Fallback if extraction fails
        jobData = {
          role: 'New Position',
          company: 'Unknown Company',
          url: url.trim(),
          status: 'TO_APPLY' as const,
        };
      }

      onAddJob(jobData);
      setUrl("");
      setIsOpen(false);
    } catch (error) {
      console.error('Error extracting job data:', error);
      // Still add the job with basic info
      onAddJob({
        role: 'New Position',
        company: 'Unknown Company',
        url: url.trim(),
        status: 'TO_APPLY',
      });
      setUrl("");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-black text-white hover:scale-105 hover:shadow-xl transition-all duration-200 ease-in-out">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Add New Job</DialogTitle>
          <DialogDescription className="text-gray-500">
            Paste a job posting URL to automatically extract details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="Paste job posting URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isLoading}
              className="text-sm bg-gray-50 border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="border border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !url.trim()}
              className="bg-blue-600 text-white rounded-xl transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Add Job'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}