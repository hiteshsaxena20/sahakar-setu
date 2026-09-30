import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Award, Download, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockCertificates = [
  { id: '1', certificateNumber: 'NCCT-2024-VAM-00123', trainee: 'Priya Patil', programme: 'Dairy Cooperative Management', course: 'Cooperative Principles & Values', issueDate: '2024-01-20', status: 'ISSUED' },
  { id: '2', certificateNumber: 'NCCT-2024-VAM-00124', trainee: 'Rajesh Kumar', programme: 'Dairy Cooperative Management', course: 'Dairy Farm Management', issueDate: '2024-01-22', status: 'ISSUED' },
  { id: '3', certificateNumber: 'NCCT-2024-RIC-00045', trainee: 'Sunita Devi', programme: 'Agricultural Marketing', course: 'Agri Marketing Fundamentals', issueDate: '2024-02-15', status: 'VERIFIED' },
  { id: '4', certificateNumber: 'NCCT-2024-ICM-00067', trainee: 'Amit Shah', programme: 'Financial Management for Cooperatives', course: 'Financial Management', issueDate: '2024-03-10', status: 'PENDING' },
];

export function Certificates() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED': return 'success';
      case 'VERIFIED': return 'info';
      case 'PENDING': return 'warning';
      case 'REVOKED': return 'danger';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.certificates')}</h1>
          <p className="text-gray-500 mt-1">{t('lms.certificates')}</p>
        </div>
        <Button className="btn-primary" leftIcon={<Plus />}>
          {t('lms.issue_certificate')}
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
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_status')}</option>
            <option value="ISSUED">{t('lms.issued')}</option>
            <option value="VERIFIED">{t('lms.verified')}</option>
            <option value="PENDING">{t('lms.pending')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.certificate_number')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.trainee')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('erp.programme')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.course')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.issue_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lms.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockCertificates
                .filter(c => !search || c.certificateNumber.toLowerCase().includes(search.toLowerCase()) || c.trainee.toLowerCase().includes(search.toLowerCase()))
                .filter(c => !statusFilter || c.status === statusFilter)
                .map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono font-medium text-gray-900">{certificate.certificateNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{certificate.trainee}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{certificate.programme}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{certificate.course}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{certificate.issueDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(certificate.status) as any}>
                        {t(`lms.${certificate.status.toLowerCase()}`) || certificate.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('lms.download_pdf')}><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('lms.verify_certificate')}><CheckCircle className="w-4 h-4" /></Button>
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