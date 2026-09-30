import { useTranslation } from 'react-i18next';
import {
  TrendingUp, Users, Target, Briefcase, BarChart3,
  MapPin, GraduationCap, Award, Clock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ChartPlaceholder } from '../components/ui/ChartPlaceholder';
import { Select } from '../components/ui/Select';
import { useState } from 'react';

export function Analytics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('monthly');

  const stats = [
    { label: 'total_trainees', value: '1,247', change: '+12%', icon: Users, color: 'primary' },
    { label: 'active_programmes', value: '23', change: '+3', icon: GraduationCap, color: 'secondary' },
    { label: 'certificates_issued', value: '892', change: '+45', icon: Award, color: 'green' },
    { label: 'total_placements', value: '556', change: '+8%', icon: Briefcase, color: 'blue' },
  ];

  const quickStats = [
    { label: 'completion_rate', value: '87.3%', icon: Target, color: 'primary' },
    { label: 'placement_rate', value: '62.1%', icon: Briefcase, color: 'green' },
    { label: 'dropout_rate', value: '12.5%', icon: Users, color: 'red' },
    { label: 'avg_attendance', value: '91.2%', icon: Clock, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.analytics')}</h1>
          <p className="text-gray-500 mt-1">{t('analytics.dashboard_subtitle') || 'Overview of training programmes and outcomes'}</p>
        </div>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-auto"
        >
          <option value="monthly">{t('analytics.monthly')}</option>
          <option value="quarterly">{t('analytics.quarterly')}</option>
          <option value="yearly">{t('analytics.yearly')}</option>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={t(`analytics.${stat.label}`) || stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color as any}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics.enrollment_trends')}</h3>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-auto text-sm"
            >
              <option value="monthly">{t('analytics.monthly')}</option>
              <option value="quarterly">{t('analytics.quarterly')}</option>
            </Select>
          </div>
          <div className="card-body">
            <ChartPlaceholder height={300} title={t('analytics.enrollment_trends')} />
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics.placement_rates')}</h3>
          </div>
          <div className="card-body">
            <ChartPlaceholder height={300} title={t('analytics.placement_rates')} />
          </div>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('analytics.dropout_heatmap') && !t('analytics.dropout_heatmap').startsWith('analytics.')
                ? t('analytics.dropout_heatmap')
                : 'Dropout Trends & Distribution'}
            </h3>
          </div>
          <div className="card-body">
            <ChartPlaceholder height={300} title="dropout_heatmap" />
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('analytics.completion_rates') && !t('analytics.completion_rates').startsWith('analytics.')
                ? t('analytics.completion_rates')
                : 'Completion Benchmark Rates'}
            </h3>
          </div>
          <div className="card-body">
            <ChartPlaceholder height={300} title="completion_rates" />
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={t(`analytics.${stat.label}`) || stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as any}
            variant="compact"
          />
        ))}
      </div>

      {/* Regional Performance */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">{t('analytics.region_heatmap') || 'Regional Performance'}</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('analytics.by_district')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('analytics.by_institution')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('analytics.total_trainees')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('analytics.completion_rate')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('analytics.placement_rate')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('analytics.dropout_rate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { district: 'Ahmednagar', institution: 'VAMNICOM', trainees: 45, completion: '92%', placement: '68%', dropout: '8%' },
                  { district: 'Pune', institution: 'ICM Pune', trainees: 67, completion: '89%', placement: '72%', dropout: '11%' },
                  { district: 'Nashik', institution: 'RICM Nashik', trainees: 32, completion: '85%', placement: '55%', dropout: '15%' },
                  { district: 'Bangalore Rural', institution: 'RICM Bangalore', trainees: 28, completion: '91%', placement: '75%', dropout: '9%' },
                  { district: 'Chennai', institution: 'ICM Chennai', trainees: 41, completion: '88%', placement: '60%', dropout: '12%' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.district}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.institution}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{row.trainees}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-green-600">{row.completion}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">{row.placement}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-red-600">{row.dropout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}