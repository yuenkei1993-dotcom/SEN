import { Student, Task } from './types';

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: '高毓軒', photoUrl: 'https://picsum.photos/seed/student1/400/400', finalSentence: '高毓軒好棒，練習完成！' },
  { id: '2', name: '周海濤', photoUrl: 'https://picsum.photos/seed/student2/400/400', finalSentence: '周海濤好棒，練習完成！' },
  { id: '3', name: '楊翹丹', photoUrl: 'https://picsum.photos/seed/student3/400/400', finalSentence: '楊翹丹好棒，練習完成！' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    studentId: '1',
    correctImageUrl: 'https://picsum.photos/seed/jam/600/400',
    incorrectImageUrl: 'https://picsum.photos/seed/towel/600/400',
    sentence: '高毓軒正在塗巧克力醬。',
    happySentence: '高毓軒塗巧克力醬好開心。',
  },
  {
    id: 't2',
    studentId: '2',
    correctImageUrl: 'https://picsum.photos/seed/bread/600/400',
    incorrectImageUrl: 'https://picsum.photos/seed/stone/600/400',
    sentence: '周海濤拿著一片麵包。',
    happySentence: '周海濤拿麵包好開心。',
  },
  {
    id: 't3',
    studentId: '3',
    correctImageUrl: 'https://picsum.photos/seed/water/600/400',
    incorrectImageUrl: 'https://picsum.photos/seed/fire/600/400',
    sentence: '楊翹丹正在喝水。',
    happySentence: '楊翹丹喝水好開心。',
  },
];
