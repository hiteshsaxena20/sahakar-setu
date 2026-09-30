import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Briefcase, Building2, MapPin, DollarSign, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockJobs = [
  { id: '1', title: 'Dairy Supervisor', employer: 'Amul', location: 'Anand, Gujarat', type: 'Full-time', stipend: '₹25,000/month', deadline: '2024-02-15', status: 'ACTIVE', applications: 12 },
  { id: '2', title: 'Cooperative Field Officer', employer: 'NABARD', location: 'Pune, Maharashtra', type: 'Contract', stipend: '₹30,000/month', deadline: '2024-02-20', status: 'ACTIVE', applications: 8 },
  { id: '3', title: 'Marketing Executive - Agri Products', employer: 'Mother Dairy', location: 'Delhi NCR', type: 'Full-time', stipend: '₹28,000/month', deadline: '2024-03-01', status: 'DRAFT', applications: 0 },
  { id: '4', title: 'Finance Assistant', employer: 'Maharashtra State Coop Bank', location: 'Mumbai, Maharashtra', type: 'Internship', stipend: '₹15,000/month', deadline: '2024-02-28', status: 'ACTIVE', applications: 23 },
];

export function Jobs() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'warning';
      case 'CLOSED': return 'gray';
      case 'EXPIRED': return 'danger';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.jobs')}</h1>
          <p className="text-gray-500 mt-1">{t('employment.job_list')}</p>
        </div>
        <Button className="btn-primary" leftIcon={<Plus />}>
          {t('employment.create_job')}
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
            <option value="ACTIVE">{t('employment.active')}</option>
            <option value="DRAFT">{t('employment.draft')}</option>
            <option value="CLOSED">{t('employment.closed')}</option>
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_types')}</option>
            <option value="Full-time">{t('employment.full_time')}</option>
            <option value="Part-time">{t('employment.part_time')}</option>
            <option value="Contract">{t('employment.contract')}</option>
            <option value="Internship">{t('employment.internship')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.job_title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.employer')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.location')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.stipend')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.deadline')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.applications')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockJobs
                .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.employer.toLowerCase().includes(search.toLowerCase()))
                .filter(j => !statusFilter || j.status === statusFilter)
                .filter(j => !typeFilter || j.type === typeFilter)
                .map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{job.employer}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.stipend}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {job.deadline}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-primary-600">{job.applications}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(job.status) as any}>
                        {t(`employment.${job.status.toLowerCase()}`) || job.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('employment.view_applications')}><Briefcase className="w-4 h-4" /></Button>
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