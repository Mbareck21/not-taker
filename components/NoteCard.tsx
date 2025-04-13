"use client";

import React from 'react';
import type { INote } from '@/lib/models/Note'; // Change to use the interface
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Use alias
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'; // Use App Router's navigation

interface NoteCardProps {
  note: INote;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    // Navigate to the detailed view page
    if (note.id) {
      router.push(`/notes/${note.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering navigation when clicking delete
    if (note.id) {
      onDelete(note.id);
    }
  };

  // Basic color cycling for the subject title based on ID
  const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-red-600', 'text-yellow-600'];
  // Simple hash function to get a somewhat consistent color per note
  const colorIndex = note.id ? 
    note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length :
    0;
  const subjectColor = colors[colorIndex];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col h-full" onClick={handleViewDetails}>
      <CardHeader className="pb-2">
        <CardTitle className={`font-bold ${subjectColor}`}>{note.subject}</CardTitle>
        {note.subHeader && (
          <CardDescription>{note.subHeader}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        {/* Display bullet points preview */}
        <div className="text-sm text-muted-foreground space-y-1">
          {Array.isArray(note.content) ? (
            <ul className="list-disc pl-5 line-clamp-3">
              {note.content.slice(0, 3).map((item, index) => (
                <li key={index} className="line-clamp-1">{item}</li>
              ))}
              {note.content.length > 3 && (
                <li className="text-muted-foreground">+{note.content.length - 3} more bullet points...</li>
              )}
            </ul>
          ) : (
            <p className="line-clamp-3">{note.content}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 pb-4">
        <span className="text-xs text-muted-foreground">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-3"> {/* Increased gap between buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="min-w-[70px]" // Ensure minimum width
          >
            View
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteClick}
            className="min-w-[70px]" // Ensure minimum width
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
