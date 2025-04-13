import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NoteFormData } from '@/components/NoteForm';
import connectMongoDB from "@/lib/mongodb";
import Note, { INote } from '@/lib/models/Note';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .lean<Array<INote & { _id: mongoose.Types.ObjectId }>>()
      .exec(); // Add exec() for proper promise resolution

    // Ensure proper data transformation
    const transformedNotes = notes.map(note => ({
      id: note._id.toString(),
      subject: note.subject,
      subHeader: note.subHeader || '',
      content: Array.isArray(note.content) ? note.content : [],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));

    return NextResponse.json({ 
      success: true, 
      data: transformedNotes 
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as NoteFormData;
    
    // Validate content array
    if (!Array.isArray(body.content) || body.content.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content must be a non-empty array' },
        { status: 400 }
      );
    }

    const newNote = await Note.create(body);
    
    // Transform the note to include id and ensure consistent format
    const transformedNote = {
      id: newNote._id.toString(),
      subject: newNote.subject,
      subHeader: newNote.subHeader || '',
      content: Array.isArray(newNote.content) ? newNote.content : [],
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    };
    
    return NextResponse.json(
      { success: true, data: transformedNote },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}