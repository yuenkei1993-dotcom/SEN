import { Student, Task } from './types';

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: '高毓軒', photoUrl: 'https://picsum.photos/seed/student1/400/400', finalSentence: '高毓軒吃棉花糖好開心。' },
  { id: '2', name: '周海濤', photoUrl: 'https://picsum.photos/seed/student2/400/400', finalSentence: '周海濤吃棉花糖好開心。' },
  { id: '3', name: '楊翹丹', photoUrl: 'https://picsum.photos/seed/student3/400/400', finalSentence: '楊翹丹吃棉花糖好開心。' },
];

export const INITIAL_TASKS: Task[] = [
  // 高毓軒
  { id: 't1-1', studentId: '1', correctImageUrl: 'https://i.postimg.cc/ncfZpfCx/gao-yu-xuan-(1).png', incorrectImageUrl: 'https://i.postimg.cc/FzZTMSYW/li-xu-shan.png', sentence: '高毓軒', happySentence: '高毓軒' },
  { id: 't1-2', studentId: '1', correctImageUrl: 'https://i.postimg.cc/Hx3SK5cb/Get-Img.jpg', incorrectImageUrl: 'https://i.postimg.cc/YqF6LYrz/shutterstock-710865547.jpg', sentence: '吃棉花糖', happySentence: '吃棉花糖' },
  { id: 't1-3', studentId: '1', correctImageUrl: 'https://i.postimg.cc/wvscpGBZ/images.jpg', incorrectImageUrl: 'https://i.postimg.cc/FsnRyspR/images-(1).jpg', sentence: '好開心', happySentence: '好開心' },
  // 周海濤
  { id: 't2-1', studentId: '2', correctImageUrl: 'https://i.postimg.cc/rpX59mm2/zhou-hai-tao-(2).png', incorrectImageUrl: 'https://i.postimg.cc/JHs3JGcZ/li-xu-shan.png', sentence: '周海濤', happySentence: '周海濤' },
  { id: 't2-2', studentId: '2', correctImageUrl: 'https://i.postimg.cc/Hx3SK5cb/Get-Img.jpg', incorrectImageUrl: 'https://i.postimg.cc/YqF6LYrz/shutterstock-710865547.jpg', sentence: '吃棉花糖', happySentence: '吃棉花糖' },
  { id: 't2-3', studentId: '2', correctImageUrl: 'https://i.postimg.cc/wvscpGBZ/images.jpg', incorrectImageUrl: 'https://i.postimg.cc/FsnRyspR/images-(1).jpg', sentence: '好開心', happySentence: '好開心' },
  // 楊翹丹
  { id: 't3-1', studentId: '3', correctImageUrl: 'https://i.postimg.cc/1tRnWN1Y/yang-qiao-dan.png', incorrectImageUrl: 'https://i.postimg.cc/JHs3JGcZ/li-xu-shan.png', sentence: '楊翹丹', happySentence: '楊翹丹' },
  { id: 't3-2', studentId: '3', correctImageUrl: 'https://i.postimg.cc/Hx3SK5cb/Get-Img.jpg', incorrectImageUrl: 'https://i.postimg.cc/YqF6LYrz/shutterstock-710865547.jpg', sentence: '吃棉花糖', happySentence: '吃棉花糖' },
  { id: 't3-3', studentId: '3', correctImageUrl: 'https://i.postimg.cc/wvscpGBZ/images.jpg', incorrectImageUrl: 'https://i.postimg.cc/FsnRyspR/images-(1).jpg', sentence: '好開心', happySentence: '好開心' },
];
