import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Search, Eye, Calendar, Video, QrCode, Check, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';

const mockAttendance = [
  { id: '1', programme: 'Dairy Cooperative Management', date: '2024-01-20', session: 'Morning - Cooperative Principles', method: 'FACE', total: 45, present: 42, status: 'COMPLETED' },
  { id: '2', programme: 'Dairy Cooperative Management', date: '2024-01-21', session: 'Afternoon - Dairy Farming', method: 'QR', total: 45, present: 40, status: 'COMPLETED' },
  { id: '3', programme: 'Agricultural Marketing', date: '2024-02-05', session: 'Morning - Market Analysis', method: 'FACE', total: 32, present: 28, status: 'IN_PROGRESS' },
  { id: '4', programme: 'Financial Management', date: '2024-03-10', session: 'Full Day - Budgeting', method: 'QR', total: 35, present: 0, status: 'SCHEDULED' },
];

export function Attendance() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'SCHEDULED': return 'warning';
      default: return 'gray';
    }
  };

  const getMethodIcon = (method: string) => {
    return method === 'FACE' ? <Video className="w-4 h-4" /> : <QrCode className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.attendance')}</h1>
          <p className="text-gray-500 mt-1">{t('attendance.attendance_history')}</p>
        </div>
        <div className="flex gap-2">
          <Button className="btn-primary" leftIcon={<Plus />}>
            {t('attendance.mark_attendance')}
          </Button>
          <Button className="btn-secondary" leftIcon={<QrCode />}>
            {t('attendance.generate_qr')}
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
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_methods')}</option>
            <option value="FACE">{t('attendance.face_recognition')}</option>
            <option value="QR">{t('attendance.qr_code')}</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t('common.all_status')}</option>
            <option value="COMPLETED">{t('attendance.completed')}</option>
            <option value="IN_PROGRESS">{t('attendance.in_progress')}</option>
            <option value="SCHEDULED">{t('attendance.scheduled')}</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.session')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.method')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.total')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.present')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.rate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('attendance.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAttendance
                .filter(a => !search || a.programme.toLowerCase().includes(search.toLowerCase()))
                .filter(a => !methodFilter || a.method === methodFilter)
                .filter(a => !statusFilter || a.status === statusFilter)
                .map((attendance) => {
                  const rate = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0;
                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{attendance.programme}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{attendance.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{attendance.session}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {getMethodIcon(attendance.method)}
                          {attendance.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{attendance.total}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{attendance.present}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rate >= 90 ? 'bg-green-100 text-green-700' : rate >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(attendance.status) as any}>
                          {t(`attendance.${attendance.status.toLowerCase().replace('_', '_')}`) || attendance.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" aria-label={t('common.view')}><Eye className="w-4 h-4" /></Button>
                          {attendance.status === 'IN_PROGRESS' && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" aria-label={t('attendance.mark_present')}><Check className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" aria-label={t('attendance.mark_absent')}><X className="w-4 h-4" /></Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}