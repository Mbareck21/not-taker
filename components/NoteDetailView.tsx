"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NoteForm, { NoteFormData } from './NoteForm';
import { ArrowLeft, Edit, Trash } from 'lucide-react';

interface NoteDetailViewProps {
  note: {
    id: string;
    subject: string;
    subHeader?: string;
    content: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  onClose: () => void;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({ note: initialNote, onClose }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState(initialNote);

  // Theme variables
  const bgColor = "bg-card";
  const subjectColor = "text-primary";

  // Update local note state when initialNote changes
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof onClose === 'function') {
      onClose();
    } else {
      router.push('/');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (!note?.id || !confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        return;
      }

      const response = await axios.delete(`/api/notes/${note.id}`);
      if (response.data?.success) {
        toast.success('Note deleted successfully');
        if (typeof onClose === 'function') {
          onClose();
        } else {
          router.push('/');
        }
      } else {
        throw new Error('Failed to delete note');
      }
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (data: NoteFormData) => {
    if (!note?.id) return;
    
    setIsSubmitting(true);
    try {
      const contentArray = typeof data.content === 'string' 
        ? data.content.split('\n').filter(line => line.trim().length > 0)
        : data.content;

      const response = await axios.put(`/api/notes/${note.id}`, {
        ...data,
        content: contentArray
      });

      if (response.data?.success) {
        const updatedNote = response.data.data;
        setNote({
          ...updatedNote,
          createdAt: new Date(updatedNote.createdAt),
          updatedAt: new Date(updatedNote.updatedAt)
        });
        toast.success('Note updated successfully');
        setIsEditing(false);
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-grow space-y-6">
        {/* Navigation bar */}
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Notes
          </Button>
          
          <div className="flex gap-4"> {/* Increased gap between buttons */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Note</DialogTitle>
                </DialogHeader>
                <NoteForm 
                  initialData={note} 
                  onSubmit={handleUpdate} 
                  isSubmitting={isSubmitting}
                  submitButtonText="Update Note"
                />
              </DialogContent>
            </Dialog>

            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex items-center gap-2 min-w-[100px]"
            >
              <Trash className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Note Card with animation */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`w-full max-w-4xl mx-auto shadow-lg ${bgColor}`}>
              <CardHeader className="border-b">
                <CardTitle className={`text-3xl font-bold ${subjectColor}`}>
                  {note.subject}
                </CardTitle>
                {note.subHeader && (
                  <CardDescription className="text-lg">{note.subHeader}</CardDescription>
                )}
                <p className="text-sm text-muted-foreground pt-2">
                  Created: {new Date(note.createdAt).toLocaleString()} | Last Updated: {new Date(note.updatedAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Display bullet points with animations */}
                <div className="prose dark:prose-invert max-w-none">
                  {Array.isArray(note.content) && note.content.length > 0 ? (
                    <ul className="space-y-4">
                      {note.content.map((item, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="font-medium"
                        >
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    typeof note.content === 'string' ? (
                      <p>{note.content}</p>
                    ) : (
                      <p className="text-muted-foreground">No content available.</p>
                    )
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(note.content) 
                    ? `${note.content.length} bullet point${note.content.length !== 1 ? 's' : ''}` 
                    : ''}
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Copyright Footer */}
      <footer className="py-4 mt-8 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} Note Maestro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NoteDetailView;
