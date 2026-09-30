import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const mockProgrammes = [
  { id: '1', title: 'Dairy Cooperative Management', institution: 'VAMNICOM', startDate: '2024-01-15', endDate: '2024-03-15', capacity: 50, status: 'ONGOING', nominees: 45 },
  { id: '2', title: 'Agricultural Marketing', institution: 'RICM Bangalore', startDate: '2024-02-01', endDate: '2024-04-01', capacity: 40, status: 'PUBLISHED', nominees: 32 },
  { id: '3', title: 'Financial Management for Cooperatives', institution: 'ICM Pune', startDate: '2024-03-01', endDate: '2024-05-01', capacity: 35, status: 'DRAFT', nominees: 0 },
  { id: '4', title: 'Digital Skills for Rural Youth', institution: 'VAMNICOM', startDate: '2024-04-01', endDate: '2024-06-01', capacity: 60, status: 'COMPLETED', nominees: 58 },
];

export function Programmes() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.programmes')}</h1>
          <p className="text-gray-500 mt-1">{t('erp.programme_list')}</p>
        </div>
        <Button className="btn-primary" leftIcon={<Plus />}>
          {t('erp.create_programme')}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">{t('common.all_status')}</option>
            <option value="DRAFT">{t('erp.status_draft')}</option>
            <option value="PUBLISHED">{t('erp.status_published')}</option>
            <option value="ONGOING">{t('erp.status_ongoing')}</option>
            <option value="COMPLETED">{t('erp.status_completed')}</option>
            <option value="CANCELLED">{t('erp.status_cancelled')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.programme_title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.institution')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.start_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.end_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.capacity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nominees')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockProgrammes
                .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
                .filter(p => !statusFilter || p.status === statusFilter)
                .map((programme) => (
                  <tr key={programme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{programme.title}</div>
                      <div className="text-sm text-gray-500">{programme.institution}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{programme.institution}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{programme.startDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{programme.endDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{programme.capacity}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        programme.status === 'ONGOING' ? 'badge-success' :
                        programme.status === 'PUBLISHED' ? 'badge-info' :
                        programme.status === 'COMPLETED' ? 'badge-gray' :
                        programme.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {t(`erp.status_${programme.status.toLowerCase()}`) || programme.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{programme.nominees}/{programme.capacity}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.delete')} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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

// Need to import useState
import { useState } from 'react';