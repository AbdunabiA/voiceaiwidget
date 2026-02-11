import { useParams } from 'react-router-dom';
import { MessageSquare, Zap, Languages } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConversationChart from '@/components/analytics/ConversationChart';
import TopQuestions from '@/components/analytics/TopQuestions';
import { useAnalytics } from '@/hooks/useSites';

const COLORS = ['#6C5CE7', '#00b894', '#fdcb6e', '#e17055', '#74b9ff'];

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: analytics, isLoading } = useAnalytics(id!);

  if (isLoading) return <p className="text-gray-500">Loading analytics...</p>;
  if (!analytics) return <p className="text-gray-500">No analytics data yet.</p>;

  const langData = Object.entries(analytics.language_breakdown).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.total_conversations}</p>
              <p className="text-sm text-gray-500">Total Conversations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.average_messages_per_conversation}</p>
              <p className="text-sm text-gray-500">Avg Messages/Chat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Languages className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.total_actions_triggered}</p>
              <p className="text-sm text-gray-500">Navigation Actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {langData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={langData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {langData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <TopQuestions questions={analytics.top_questions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
