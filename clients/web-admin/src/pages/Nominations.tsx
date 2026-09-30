import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Filter, Edit, Eye, Check, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockNominations = [
  { id: '1', programme: 'Dairy Cooperative Management', nomineeName: 'Priya Patil', nomineePhone: '9876543210', nomineeDistrict: 'Ahmednagar', nomineePacs: 'MAH-001', status: 'PENDING', nominatingBody: 'Maharashtra State Coop Dept' },
  { id: '2', programme: 'Dairy Cooperative Management', nomineeName: 'Rajesh Kumar', nomineePhone: '9876543211', nomineeDistrict: 'Pune', nomineePacs: 'MAH-002', status: 'APPROVED', nominatingBody: 'Maharashtra State Coop Dept' },
  { id: '3', programme: 'Agricultural Marketing', nomineeName: 'Sunita Devi', nomineePhone: '9876543212', nomineeDistrict: 'Bangalore Rural', nomineePacs: 'KAR-001', status: 'PENDING', nominatingBody: 'Karnataka State Coop Dept' },
  { id: '4', programme: 'Financial Management for Cooperatives', nomineeName: 'Amit Shah', nomineePhone: '9876543213', nomineeDistrict: 'Pune', nomineePacs: 'MAH-003', status: 'REJECTED', nominatingBody: 'Maharashtra State Coop Dept' },
];

export function Nominations() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.nominations')}</h1>
          <p className="text-gray-500 mt-1">{t('erp.nomination_list')}</p>
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
            <option value="PENDING">{t('erp.status_pending')}</option>
            <option value="APPROVED">{t('erp.status_approved')}</option>
            <option value="REJECTED">{t('erp.status_rejected')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.programme')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nominee_name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nominee_phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nominee_district')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nominee_pacs')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nominating_body')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.nomination_status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockNominations
                .filter(n => !search || n.nomineeName.toLowerCase().includes(search.toLowerCase()))
                .filter(n => !statusFilter || n.status === statusFilter)
                .map((nomination) => (
                  <tr key={nomination.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{nomination.programme}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{nomination.nomineeName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{nomination.nomineePhone}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{nomination.nomineeDistrict}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{nomination.nomineePacs}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{nomination.nominatingBody}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(nomination.status) as any}>
                        {t(`erp.status_${nomination.status.toLowerCase()}`) || nomination.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        {nomination.status === 'PENDING' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" aria-label={t('erp.approve_nomination')}><Check className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" aria-label={t('erp.reject_nomination')}><X className="w-4 h-4" /></Button>
                          </>
                        )}
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