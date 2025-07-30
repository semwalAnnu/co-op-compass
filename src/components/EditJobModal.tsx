'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Card } from "@/types/User";

interface EditJobModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: Card) => void;
}

export default function EditJobModal({ card, isOpen, onClose, onSave }: EditJobModalProps) {
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    url: '',
    location: '',
    deadline: '',
  });

  // Update form data when card changes
  useEffect(() => {
    if (card) {
      setFormData({
        role: card.role || '',
        company: card.company || '',
        url: card.url || '',
        location: card.location || '',
        deadline: card.deadline || '',
      });
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    const updatedCard: Card = {
      ...card,
      role: formData.role.trim(),
      company: formData.company.trim(),
      url: formData.url.trim(),
      location: formData.location.trim() || undefined,
      deadline: formData.deadline.trim() || undefined,
    };

    onSave(updatedCard);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Edit Job</DialogTitle>
          <DialogDescription className="text-gray-500">
            Update the job details below
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-800">
              Job Title *
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="e.g., Software Engineer Intern"
              required
              className="bg-gray-50 border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-800">
              Company *
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="e.g., Google"
              required
              className="bg-gray-50 border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-gray-800">
              Job URL *
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://..."
              required
              className="bg-gray-50 border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-800">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="bg-gray-50 border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium text-gray-800">
              Deadline
            </Label>
            <Input
              id="deadline"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              placeholder="e.g., December 31, 2024"
              className="bg-gray-50 border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 text-white rounded-xl transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 