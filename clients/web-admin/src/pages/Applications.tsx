import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Search, Edit, Eye, FileText, User, Check, X, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockApplications = [
  { id: '1', applicant: 'Priya Patil', job: 'Dairy Supervisor', employer: 'Amul', appliedDate: '2024-01-15', matchScore: 92, status: 'SHORTLISTED', resume: true },
  { id: '2', applicant: 'Rajesh Kumar', job: 'Cooperative Field Officer', employer: 'NABARD', appliedDate: '2024-01-18', matchScore: 85, status: 'APPLIED', resume: true },
  { id: '3', applicant: 'Sunita Devi', job: 'Marketing Executive', employer: 'Mother Dairy', appliedDate: '2024-01-20', matchScore: 78, status: 'INTERVIEW', resume: true },
  { id: '4', applicant: 'Amit Shah', job: 'Finance Assistant', employer: 'Maharashtra State Coop Bank', appliedDate: '2024-01-22', matchScore: 65, status: 'REJECTED', resume: false },
  { id: '5', applicant: 'Neha Singh', job: 'Dairy Supervisor', employer: 'Amul', appliedDate: '2024-01-25', matchScore: 88, status: 'OFFERED', resume: true },
];

export function Applications() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'info';
      case 'SHORTLISTED': return 'warning';
      case 'INTERVIEW': return 'primary';
      case 'OFFERED': return 'success';
      case 'REJECTED': return 'danger';
      case 'ACCEPTED': return 'success';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.applications')}</h1>
          <p className="text-gray-500 mt-1">{t('employment.applications')}</p>
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
            <option value="APPLIED">{t('employment.applied')}</option>
            <option value="SHORTLISTED">{t('employment.shortlisted')}</option>
            <option value="INTERVIEW">{t('employment.interview')}</option>
            <option value="OFFERED">{t('employment.offered')}</option>
            <option value="REJECTED">{t('employment.rejected')}</option>
            <option value="ACCEPTED">{t('employment.accepted')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.applicant')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.job_title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.employer')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.applied_date')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.match_score')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.status')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.resume')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockApplications
                .filter(a => !search || a.applicant.toLowerCase().includes(search.toLowerCase()) || a.job.toLowerCase().includes(search.toLowerCase()))
                .filter(a => !statusFilter || a.status === statusFilter)
                .map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.applicant}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{app.job}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{app.employer}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{app.appliedDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${app.matchScore >= 85 ? 'bg-green-100 text-green-700' : app.matchScore >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {app.matchScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(app.status) as any}>
                        {t(`employment.${app.status.toLowerCase()}`) || app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {app.resume ? (
                        <FileText className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
                        {app.status === 'APPLIED' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" aria-label={t('employment.shortlist')}><Check className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" aria-label={t('employment.reject')}><X className="w-4 h-4" /></Button>
                          </>
                        )}
                        {app.status === 'INTERVIEW' && (
                          <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50" aria-label={t('employment.schedule_interview')}><Clock className="w-4 h-4" /></Button>
                        )}
                        {app.status === 'OFFERED' && (
                          <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" aria-label={t('employment.make_offer')}><Check className="w-4 h-4" /></Button>
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