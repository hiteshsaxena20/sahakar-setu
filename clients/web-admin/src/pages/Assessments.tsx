import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, ClipboardCheck, Brain } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockAssessments = [
  { id: '1', title: 'Cooperative Principles Quiz', course: 'Cooperative Principles & Values', type: 'MCQ', questions: 20, passingScore: 60, timeLimit: 30, status: 'PUBLISHED' },
  { id: '2', title: 'Dairy Farm Management Assessment', course: 'Dairy Farm Management', type: 'MCQ', questions: 25, passingScore: 70, timeLimit: 45, status: 'DRAFT' },
  { id: '3', title: 'Financial Management Case Study', course: 'Financial Management for Cooperatives', type: 'SUBJECTIVE', questions: 5, passingScore: 60, timeLimit: 60, status: 'PUBLISHED' },
  { id: '4', title: 'सहकारी सिद्धांत क्विज', course: 'सहकारी सिद्धांत और मूल्य', type: 'MCQ', questions: 20, passingScore: 60, timeLimit: 30, status: 'PUBLISHED' },
];

export function Assessments() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'warning';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.assessments')}</h1>
          <p className="text-gray-500 mt-1">{t('lms.assessments')}</p>
        </div>
        <div className="flex gap-2">
          <Button className="btn-primary" leftIcon={<Plus />}>
            {t('lms.create_assessment')}
          </Button>
          <Button className="btn-secondary" leftIcon={<Brain />}>
            {t('lms.generate_quiz')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_types')}</option>
            <option value="MCQ">{t('lms.mcq')}</option>
            <option value="SUBJECTIVE">{t('lms.subjective')}</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_status')}</option>
            <option value="PUBLISHED">{t('lms.published')}</option>
            <option value="DRAFT">{t('lms.draft')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.assessment_title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.course')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.questions')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.passing_score')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.time_limit')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAssessments
                .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()))
                .filter(a => !typeFilter || a.type === typeFilter)
                .filter(a => !statusFilter || a.status === statusFilter)
                .map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{assessment.course}</td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{assessment.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{assessment.questions}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{assessment.passingScore}%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{assessment.timeLimit} min</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(assessment.status) as any}>
                        {t(`lms.${assessment.status.toLowerCase()}`) || assessment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('lms.manage_questions')}><ClipboardCheck className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}