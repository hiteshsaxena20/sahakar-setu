import { useTranslation } from 'react-i18next';
import {
  Users, GraduationCap, Award, Briefcase, TrendingUp,
  Target, Clock, CheckCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ChartPlaceholder } from '../components/ui/ChartPlaceholder';

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

export function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('common.dashboard')}</h1>
          <p className="text-gray-500 mt-1">{t('analytics.dashboard_subtitle') || 'Overview of training programmes and outcomes'}</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto">
            <option value="monthly">{t('analytics.monthly')}</option>
            <option value="quarterly">{t('analytics.quarterly')}</option>
            <option value="yearly">{t('analytics.yearly')}</option>
          </select>
        </div>
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
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics.enrollment_trends')}</h3>
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
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics.dropout_heatmap')}</h3>
          </div>
          <div className="card-body">
            <ChartPlaceholder height={300} title={t('analytics.dropout_heatmap')} />
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics.completion_rates')}</h3>
          </div>
          <div className="card-body">
            <ChartPlaceholder height={300} title={t('analytics.completion_rates')} />
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

      {/* Recent Activity */}
      <Card>
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('analytics.recent_activity') || 'Recent Activity'}</h3>
          <button className="btn-outline btn-sm">{t('common.view_all')}</button>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {[
              { action: 'New programme created', entity: 'Dairy Cooperative Management', time: '2 hours ago', type: 'success' },
              { action: 'Certificates issued', entity: 'Batch of 45 trainees', time: '4 hours ago', type: 'info' },
              { action: 'Job posted', entity: 'Dairy Supervisor at Amul', time: '6 hours ago', type: 'primary' },
              { action: 'Assessment completed', entity: 'Financial Management module', time: '1 day ago', type: 'warning' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${activity.type}-100`}>
                  <CheckCircle className={`w-5 h-5 text-${activity.type}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.entity}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}