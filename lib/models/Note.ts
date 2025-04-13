import mongoose, { Schema, model } from "mongoose";

export interface INote {
  id: string;  // Making id required since we always set it in the API response
  _id?: string;
  subject: string;
  subHeader?: string;
  content: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    subHeader: {
      type: String,
      trim: true,
      maxlength: [150, 'Subheader cannot exceed 150 characters'],
      default: ''
    },
    content: {
      type: [String],
      required: [true, 'Content is required'],
      validate: {
        validator: function(v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one bullet point is required'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Add compound text index for better search
noteSchema.index({ 
  subject: 'text', 
  subHeader: 'text',
  content: 'text'
}, {
  weights: {
    subject: 10,
    subHeader: 5,
    content: 1
  }
});

// If the Note model already exists, use it; otherwise, create it
export const Note = mongoose.models.Note || model<INote>('Note', noteSchema);

export default Note;
