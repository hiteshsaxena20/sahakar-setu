import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Trash2, GraduationCap, MapPin, Phone, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockTrainees = [
  { id: '1', name: 'Priya Patil', phone: '9876543210', email: 'priya@email.com', district: 'Ahmednagar', pacsId: 'MAH-001', skills: ['Dairy Farming', 'Cooperative Mgmt'], institution: 'VAMNICOM', status: 'active' },
  { id: '2', name: 'Rajesh Kumar', phone: '9876543211', email: 'rajesh@email.com', district: 'Pune', pacsId: 'MAH-002', skills: ['Marketing', 'Sales'], institution: 'RICM Bangalore', status: 'active' },
  { id: '3', name: 'Sunita Devi', phone: '9876543212', email: 'sunita@email.com', district: 'Bangalore Rural', pacsId: 'KAR-001', skills: ['Finance', 'Accounting'], institution: 'ICM Pune', status: 'active' },
  { id: '4', name: 'Amit Shah', phone: '9876543213', email: 'amit@email.com', district: 'Nashik', pacsId: 'MAH-003', skills: ['IT', 'Digital Skills'], institution: 'VAMNICOM', status: 'inactive' },
];

export function Trainees() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.trainees')}</h1>
          <p className="text-gray-500 mt-1">{t('erp.trainee_list')}</p>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">{t('common.all_status')}</option>
            <option value="active">{t('erp.active')}</option>
            <option value="inactive">{t('erp.inactive')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.district')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.pacs_id')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.institution')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.skills')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockTrainees
                .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()))
                .filter(t => !statusFilter || t.status === statusFilter)
                .map((trainee) => (
                  <tr key={trainee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{trainee.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{trainee.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{trainee.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{trainee.district}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{trainee.pacsId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{trainee.institution}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {trainee.skills.map((skill, i) => (
                          <Badge key={i} variant="gray">{skill}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={trainee.status === 'active' ? 'success' : 'gray'}>
                        {t(`erp.${trainee.status}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
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