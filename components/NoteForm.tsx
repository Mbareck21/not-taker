"use client";

import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { INote } from '@/lib/models/Note';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define the Zod schema for validation
const noteSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required." }).max(100, { message: "Subject cannot exceed 100 characters." }),
  subHeader: z.string().max(150, { message: "Subheader cannot exceed 150 characters." }).optional(),
  content: z.string().min(1, { message: "Content cannot be empty." }),
});

// Define the type for the form values based on the schema
export type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  initialData?: INote | null; // Optional initial data for editing
  onSubmit: (data: NoteFormData) => void; // Function to handle form submission
  isSubmitting?: boolean; // Optional flag to disable button during submission
  submitButtonText?: string; // Optional text for the submit button
}

const NoteForm: React.FC<NoteFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Save Note"
}) => {
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      subject: initialData?.subject || "",
      subHeader: initialData?.subHeader || "",
      content: initialData?.content ? initialData.content.join('\n') : "",
    },
  });

  // Reset form if initialData changes (e.g., when opening edit modal)
  useEffect(() => {
    if (initialData) {
      form.reset({
        subject: initialData.subject,
        subHeader: initialData.subHeader || "",
        content: initialData.content.join('\n'), // Join array items with newlines for editing
      });
    } else {
       form.reset({ // Reset to empty if no initial data (for create mode)
        subject: "",
        subHeader: "",
        content: "",
      });
    }
  }, [initialData, form]);


  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error('Form validation failed:', errors);
        })} 
        className="space-y-6"
      >
        {/* Subject Field */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter the main subject..." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SubHeader Field */}
        <FormField
          control={form.control}
          name="subHeader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subheader (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter an optional subheader..." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content Field */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                {/* Use Textarea for multi-line content */}
                <Textarea
                  placeholder="Enter bullet points (one per line)..."
                  className="min-h-[150px]" // Give it some default height
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Enter each bullet point on a new line. These will be displayed as a formatted list in your note.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
};

export default NoteForm;
