'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Card } from "@/types/User";

interface AddJobDialogProps {
  onAddJob: (jobData: {
    role: string;
    company: string;
    url: string;
    location?: string;
    deadline?: string;
    status: Card['status'];
  }) => void;
}

export default function AddJobDialog({ onAddJob }: AddJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    url: '',
    location: '',
    deadline: '',
    status: 'TO_APPLY' as Card['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJob({
      role: formData.role,
      company: formData.company,
      url: formData.url,
      location: formData.location || undefined,
      deadline: formData.deadline || undefined,
      status: formData.status
    });
    setFormData({
      role: '',
      company: '',
      url: '',
      location: '',
      deadline: '',
      status: 'TO_APPLY'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
          <DialogDescription>
            Add a new job application to your tracking board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Job Title *
            </label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Software Engineer Intern"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">
              Company *
            </label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., Google"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Job URL *
            </label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Vancouver, BC"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              Application Deadline
            </label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value: Card['status']) => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TO_APPLY">To Apply</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 