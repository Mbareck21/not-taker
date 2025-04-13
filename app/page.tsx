"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { INote } from '@/lib/models/Note';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import NoteCard from '@/components/NoteCard';
import NoteForm, { NoteFormData } from '@/components/NoteForm';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [notes, setNotes] = useState<INote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<INote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []); // Added empty dependency array

  const sortNotes = (notesToSort: INote[] | undefined, order: 'newest' | 'oldest' | 'alphabetical'): INote[] => {
    // Guard against undefined or null values
    if (!notesToSort || !Array.isArray(notesToSort)) {
      return [];
    }

    // Create a new array to avoid mutating the original
    const sortedNotes = [...notesToSort];

    try {
      switch (order) {
        case 'newest':
          return sortedNotes.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return sortedNotes.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'alphabetical':
          return sortedNotes.sort((a, b) => 
            (a.subject || '').localeCompare(b.subject || '')
          );
        default:
          return sortedNotes;
      }
    } catch (error) {
      console.error('Error sorting notes:', error);
      return sortedNotes;
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/notes');
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        const notesData = response.data.data.map((note: INote) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(notesData);
        setFilteredNotes(sortNotes(notesData, sortOrder));
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to load notes: Invalid data format');
        setNotes([]);
        setFilteredNotes([]);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast.error("Failed to load notes. Please try refreshing.");
      setNotes([]);
      setFilteredNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new note
  const handleCreateNote = async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      // Process content from string to array format
      const contentArray = data.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const response = await axios.post('/api/notes', {
        ...data,
        content: contentArray
      });
      
      if (response.data?.success) {
        // Transform the note data to ensure proper date handling
        const newNote: INote = {
          ...response.data.data,
          id: response.data.data.id || response.data.data._id?.toString(),
          createdAt: new Date(response.data.data.createdAt),
          updatedAt: new Date(response.data.data.updatedAt)
        };

        // Update both notes and filtered notes atomically to ensure consistency
        const updateNotes = (prevNotes: INote[]) => {
          const updatedNotes = [newNote, ...prevNotes];
          return sortNotes(updatedNotes, sortOrder);
        };

        setNotes(updateNotes);
        setFilteredNotes(updateNotes);
        
        toast.success("Note created successfully!");
        setIsDialogOpen(false);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (id: string) => {
    // Store original state for rollback
    const originalNotes = [...notes];
    const originalFiltered = [...filteredNotes];
    
    // Optimistic UI update for both states
    const filterNotes = (notes: INote[]) => notes.filter(note => note.id !== id);
    setNotes(filterNotes);
    setFilteredNotes(filterNotes);
    
    toast.info("Deleting note..."); // Inform user

    try {
      const response = await axios.delete(`/api/notes/${id}`);
      if (response.data?.success) {
        toast.success("Note deleted successfully!");
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Restoring note.");
      // Revert both states if delete fails
      setNotes(originalNotes);
      setFilteredNotes(originalFiltered);
    }
  };

  // Note card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      }
    }),
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  // Update useEffect for filtering to handle undefined notes
  useEffect(() => {
    if (!Array.isArray(notes)) {
      setFilteredNotes([]);
      return;
    }

    try {
      let result = [...notes];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(note => 
          note?.subject?.toLowerCase().includes(query) || 
          note?.subHeader?.toLowerCase().includes(query) ||
          (Array.isArray(note?.content) && note.content.some(item => 
            item?.toLowerCase().includes(query)
          ))
        );
      }
      
      setFilteredNotes(sortNotes(result, sortOrder));
    } catch (error) {
      console.error('Error filtering notes:', error);
      setFilteredNotes([]);
    }
  }, [notes, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Note Maestro
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <PlusCircle className="h-5 w-5" /> Add New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your new note. Enter bullet points on separate lines.
                    </DialogDescription>
                  </DialogHeader>
                  <NoteForm
                    onSubmit={handleCreateNote}
                    isSubmitting={isSubmitting}
                    submitButtonText="Create Note"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row gap-4 pb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <label htmlFor="sortOrder" className="sr-only">Sort Notes</label>
              <select 
                id="sortOrder"
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
                className="p-2 border rounded bg-background"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A to Z</option>
              </select>
            </div>
          </div>
        </header>

        {/* Notes Grid with Animations */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-lg">
            {searchQuery ? (
              <div>
                <p className="text-2xl font-semibold mb-2">No matching notes</p>
                <p className="text-muted-foreground">Try adjusting your search query</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-semibold mb-2">No notes yet</p>
                <p className="text-muted-foreground mb-4">Create your first note to get started!</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Note
                </Button>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotes.map((note, index) => {
                // Guard against potentially undefined notes
                if (!note || !note.id) return null;
                
                return (
                  <motion.div
                    key={`note-${note.id}`}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onDelete={handleDeleteNote}
                    />
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
      
      {/* Copyright Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} Note Maestro. All rights reserved.</p>
      </footer>
    </div>
  );
}
