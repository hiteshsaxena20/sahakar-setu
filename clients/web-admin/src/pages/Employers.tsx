import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Building2, Check, Shield, MapPin, Mail, Phone } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockEmployers = [
  { id: '1', name: 'Amul (GCMMF)', type: 'cooperative', contact: 'hr@amul.coop', location: 'Anand, Gujarat', verified: true, jobsPosted: 12 },
  { id: '2', name: 'NABARD', type: 'government', contact: 'recruitment@nabard.org', location: 'Mumbai, Maharashtra', verified: true, jobsPosted: 8 },
  { id: '3', name: 'Mother Dairy', type: 'cooperative', contact: 'careers@motherdairy.com', location: 'Delhi NCR', verified: true, jobsPosted: 5 },
  { id: '4', name: 'Maharashtra State Cooperative Bank', type: 'cooperative', contact: 'hr@mscb.com', location: 'Mumbai, Maharashtra', verified: false, jobsPosted: 3 },
  { id: '5', name: 'Tata Trusts', type: 'ngo', contact: 'jobs@tatatrusts.org', location: 'Mumbai, Maharashtra', verified: true, jobsPosted: 7 },
];

export function Employers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.employers')}</h1>
          <p className="text-gray-500 mt-1">{t('employment.employers')}</p>
        </div>
        <Button className="btn-primary" leftIcon={<Plus />}>
          {t('employment.add_employer')}
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
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all')}</option>
            <option value="true">{t('employment.verified')}</option>
            <option value="false">{t('employment.unverified')}</option>
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_types')}</option>
            <option value="cooperative">{t('employment.cooperative')}</option>
            <option value="corporate">{t('employment.corporate')}</option>
            <option value="government">{t('employment.government')}</option>
            <option value="ngo">{t('employment.ngo')}</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.contact')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.location')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.verified')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employment.jobs_posted')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockEmployers
                .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()))
                .filter(e => verifiedFilter === '' || e.verified.toString() === verifiedFilter)
                .filter(e => !typeFilter || e.type === typeFilter)
                .map((employer) => (
                  <tr key={employer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="gray">{employer.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {employer.contact}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {employer.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {employer.verified ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Shield className="w-4 h-4" />
                          {t('employment.verified')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <Shield className="w-4 h-4" />
                          {t('employment.unverified')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-primary-600">{employer.jobsPosted}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" aria-label={t('common.edit')}><Edit className="w-4 h-4" /></Button>
                        {!employer.verified && (
                          <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" aria-label={t('employment.verify')}><Check className="w-4 h-4" /></Button>
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