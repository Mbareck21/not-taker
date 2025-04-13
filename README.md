# Note Maestro

A modern note-taking application built with Next.js and MongoDB, designed for beautiful and interactive note organization.

## Features

- **Beautiful Card UI**: Notes are displayed as interactive cards for easy browsing
- **Rich Formatting**: Support for headers, subheaders, and bullet points
- **Search & Filter**: Easily find your notes with search and sorting options
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Choose your preferred theme for comfortable reading
- **Real-time Feedback**: Notifications and animations for a polished experience

## Technologies Used

- **Next.js 15**: For server-side rendering and routing
- **MongoDB**: For data persistence
- **Mongoose**: For database schema modeling
- **Prisma ORM**: For database access (transitional support)
- **Tailwind CSS**: For utility-first styling
- **Shadcn UI**: For beautiful UI components
- **Framer Motion**: For smooth animations
- **React Hook Form**: For form validation
- **Zod**: For schema validation

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- MongoDB connection string (Atlas or local)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd not-taker
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Environment setup:
   Create a `.env` file in the root directory with your MongoDB connection string:
   ```
   DATABASE_URL="mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/note-taker"
   ```

4. Generate Prisma client and update schema:
   ```
   npm run update-schema
   ```

5. Setup the MongoDB database:
   ```
   npm run db:setup
   ```

6. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Create Notes**: Click the "Add New Note" button to create a new note
- **View Notes**: Click on any note card to see its full content
- **Edit Notes**: Use the edit button on the note detail page
- **Delete Notes**: Use the delete button to remove notes
- **Search**: Use the search bar to filter notes by content
- **Sort**: Use the dropdown to sort by date or alphabetically
- **Theme**: Toggle between light and dark mode using the theme button

## Project Structure

```
not-taker/
├── app/                    # Next.js app router
│   ├── api/                # API routes
│   ├── notes/              # Note detail pages
│   ├── page.tsx            # Home page
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # UI components
│   ├── NoteCard.tsx        # Note card component
│   ├── NoteDetailView.tsx  # Note detail view
│   └── NoteForm.tsx        # Note form component
├── lib/                    # Utility functions
│   ├── db.ts               # Database connection
│   ├── models/             # Mongoose models
│   └── setupMongoDB.ts     # DB setup script
├── prisma/                 # Prisma ORM
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Prisma](https://www.prisma.io/)
