# FlowBrain

<!-- ![FlowBrain Logo](path-to-your-logo) -->

**FlowBrain** is an intelligent note-taking app that enhances your productivity by combining easy note-taking with an AI-powered chatbox. FlowBrain helps you organize your thoughts and lets you interact with your notes via a conversational AI, making information retrieval and insight generation more intuitive than ever.

## Features

### 1. **Note-Taking**

- **Efficient Note Recording**: Quickly capture your thoughts, ideas, and knowledge with a simple, intuitive note-taking interface.

### 2. **AI-Powered Chatbox**

- **Interactive AI Chat**: A built-in chatbox powered by OpenAI that allows you to query and interact with your notes. Ask questions, request summaries, or generate new insights based on your existing content.
- **Context-Aware Responses**: The AI understands the context of your notes and provides relevant, intelligent responses to your questions, making it easy to retrieve specific information or summarize key points.

## Tech Stack

- **OpenAI**
- **Pinecone**
- **Next.js**
- **Shadcn UI**
- **Clerk**
- **MongoDB**
- **Prisma**

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:ZhenniLin/ai-note-app.git
   cd flowbrain
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file with the required keys:

   - OpenAI API Key (OPENAI_API_KEY)
   - Pinecone API Key (PINECONE_API_KEY)
   - Clerk API credentials (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY / NEXT_PUBLIC_CLERK_SIGN_IN_URL / NEXT_PUBLIC_CLERK_SIGN_UP_URL / NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL / NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL)
   - MongoDB URL (DATABASE_URL)

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at `http://localhost:3000`.

## Usage

- **Record Notes**: Start taking notes.
- **AI Chat**: Use the AI-powered chatbox to ask questions about your notes, request summaries, or brainstorm ideas based on your content.

## License

MIT
