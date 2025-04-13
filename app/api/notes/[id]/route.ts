import { NextResponse } from 'next/server';
import connectMongoDB from "@/lib/mongodb";
import Note from '@/lib/models/Note';
import mongoose from 'mongoose';

// Handle GET request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    // Validate ID
    const {id} = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    // Let Mongoose handle the transformation
    return NextResponse.json({
      success: true,
      data: note.toJSON()
    });

  } catch (error) {
    console.error('[API_NOTE_GET]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle PUT request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    
    const {id} = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Ensure content is an array
    if (body.content && !Array.isArray(body.content)) {
      body.content = [body.content];
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: note.toJSON()
    });

  } catch (error) {
    console.error('[API_NOTE_PUT]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    
    const {id} = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('[API_NOTE_DELETE]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
