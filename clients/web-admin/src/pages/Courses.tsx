import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Play, BookOpen, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockCourses = [
  { id: '1', title: 'Cooperative Principles & Values', programme: 'Dairy Cooperative Management', language: 'en', modules: 8, duration: '20 hrs', status: 'PUBLISHED' },
  { id: '2', title: 'सहकारी सिद्धांत और मूल्य', programme: 'Dairy Cooperative Management', language: 'hi', modules: 8, duration: '20 hrs', status: 'PUBLISHED' },
  { id: '3', title: 'Dairy Farm Management', programme: 'Dairy Cooperative Management', language: 'en', modules: 12, duration: '35 hrs', status: 'DRAFT' },
  { id: '4', title: 'Financial Management for Cooperatives', programme: 'Financial Management for Cooperatives', language: 'en', modules: 10, duration: '25 hrs', status: 'PUBLISHED' },
];

export function Courses() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'warning';
      case 'ARCHIVED': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.courses')}</h1>
          <p className="text-gray-500 mt-1">{t('lms.course_list')}</p>
        </div>
        <Button className="btn-primary" leftIcon={<Plus />}>
          {t('lms.create_course')}
        </Button>
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
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_languages')}</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.course_title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.programme')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.language')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.modules')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.duration')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockCourses
                .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))
                .filter(c => !languageFilter || c.language === languageFilter)
                .filter(c => !statusFilter || c.status === statusFilter)
                .map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{course.programme}</td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{course.language.toUpperCase()}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.modules}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.duration}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(course.status) as any}>
                        {t(`lms.${course.status.toLowerCase()}`) || course.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('lms.view_modules')}><BookOpen className="w-4 h-4" /></Button>
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