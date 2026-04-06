export interface Student {
  id: string;
  name: string;
  photoUrl: string;
  finalSentence: string;
}

export interface Task {
  id: string;
  studentId: string;
  correctImageUrl: string;
  incorrectImageUrl: string;
  sentence: string;
  happySentence: string;
  userSelectedSentence?: string; // Add this
}

export type AppState = 'selection' | 'learning' | 'teacher' | 'final';
