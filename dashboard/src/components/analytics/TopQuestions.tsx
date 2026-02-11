import { Badge } from '@/components/ui/badge';

interface Props {
  questions: { question: string; count: number }[];
}

export default function TopQuestions({ questions }: Props) {
  if (!questions.length) {
    return <p className="text-sm text-gray-500">No questions recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-700 flex-1">{q.question}</span>
          <Badge variant="secondary">{q.count}</Badge>
        </div>
      ))}
    </div>
  );
}
