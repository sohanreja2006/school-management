export const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600', label: 'Outstanding' };
  if (percentage >= 80) return { grade: 'A', color: 'text-emerald-500', label: 'Excellent' };
  if (percentage >= 70) return { grade: 'B', color: 'text-indigo-500', label: 'Very Good' };
  if (percentage >= 60) return { grade: 'C', color: 'text-indigo-400', label: 'Good' };
  if (percentage >= 50) return { grade: 'D', color: 'text-amber-500', label: 'Average' };
  if (percentage >= 33) return { grade: 'E', color: 'text-orange-500', label: 'Satisfactory' };
  return { grade: 'F', color: 'text-rose-600', label: 'Fail' };
};
