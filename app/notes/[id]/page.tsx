"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from "sonner";
import NoteDetailView from '@/components/NoteDetailView';

type ErrorState = string | null;

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState>(null);

  const handleClose = () => {
    router.push('/');
  };

  useEffect(() => {
    const fetchNote = async () => {
      if (!params?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/notes/${params.id}`);
        if (response.data?.success) {
          // Transform the response data to match the Note interface
          const noteData = {
            ...response.data.data,
            createdAt: new Date(response.data.data.createdAt),
            updatedAt: new Date(response.data.data.updatedAt)
          };
          setNote(noteData);
        } else {
          throw new Error('Failed to fetch note data');
        }
      } catch (err) {
        console.error('Error fetching note:', err);
        
        const isNotFound = err instanceof AxiosError && err.response?.status === 404;
        const errorMessage = isNotFound
          ? 'Note not found. It may have been deleted.'
          : 'Failed to load note. Please try again.';

        setError(errorMessage);
        toast.error(isNotFound ? 'Note not found' : 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto p-8 text-center min-h-[60vh] flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-muted-foreground">{error || 'Note not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <NoteDetailView note={note} onClose={handleClose} />
    </div>
  );
}
