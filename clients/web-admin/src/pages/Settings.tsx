import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { User, Bell, Shield, Globe, Save, Key } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';

export function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: t('common.profile'), icon: User },
    { id: 'notifications', label: t('settings.notifications') || 'Notifications', icon: Bell },
    { id: 'security', label: t('settings.security') || 'Security', icon: Shield },
    { id: 'preferences', label: t('settings.preferences') || 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('common.settings')}</h1>
        <p className="text-gray-500 mt-1">{t('settings.subtitle') || 'Manage your account settings and preferences'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">{t('common.profile')}</h3>
              </div>
              <div className="card-body">
                <form className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{user?.firstName || user?.username}</h4>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-sm text-gray-400 capitalize">{user?.roles[0]?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">{t('settings.first_name')}</Label>
                      <Input id="firstName" defaultValue={user?.firstName} placeholder={t('settings.first_name')} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('settings.last_name')}</Label>
                      <Input id="lastName" defaultValue={user?.lastName} placeholder={t('settings.last_name')} />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('settings.email')}</Label>
                      <Input id="email" type="email" defaultValue={user?.email} disabled />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('settings.phone')}</Label>
                      <Input id="phone" type="tel" placeholder={t('settings.phone')} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">{t('settings.address')}</Label>
                      <Input id="address" placeholder={t('settings.address')} />
                    </div>
                  </div>
                  <Button onClick={() => setSaving(true)} className="btn-primary" rightIcon={<Save className="w-4 h-4" />}>
                    {t('common.save')}
                  </Button>
                </form>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.notifications')}</h3>
              </div>
              <div className="card-body space-y-4">
                {[
                  { id: 'email_jobs', label: t('settings.email_job_alerts') || 'Job Alerts via Email', default: true },
                  { id: 'email_courses', label: t('settings.email_course_updates') || 'Course Updates via Email', default: true },
                  { id: 'email_certificates', label: t('settings.email_certificate_ready') || 'Certificate Ready Notifications', default: true },
                  { id: 'push_attendance', label: t('settings.push_attendance_reminder') || 'Attendance Reminders', default: true },
                  { id: 'push_assessments', label: t('settings.push_assessment_due') || 'Assessment Due Reminders', default: false },
                  { id: 'sms_important', label: t('settings.sms_important') || 'Important Updates via SMS', default: true },
                ].map((item) => (
                  <label key={item.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.default}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.security')}</h3>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">{t('settings.change_password')}</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">{t('settings.current_password')}</Label>
                      <Input id="currentPassword" type="password" placeholder={t('settings.current_password')} />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">{t('settings.new_password')}</Label>
                      <Input id="newPassword" type="password" placeholder={t('settings.new_password')} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{t('settings.confirm_password')}</Label>
                      <Input id="confirmPassword" type="password" placeholder={t('settings.confirm_password')} />
                    </div>
                    <Button className="btn-primary" rightIcon={<Key className="w-4 h-4" />}>
                      {t('settings.update_password')}
                    </Button>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">{t('settings.two_factor')}</h4>
                  <p className="text-gray-500 mb-4">{t('settings.two_factor_desc') || 'Add an extra layer of security to your account.'}</p>
                  <Button variant="outline" rightIcon={<Shield className="w-4 h-4" />}>
                    {t('settings.enable_2fa') || 'Enable Two-Factor Authentication'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.preferences')}</h3>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <Label htmlFor="language">{t('settings.language')}</Label>
                  <Select id="language" defaultValue="en">
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                  <Select id="timezone" defaultValue="Asia/Kolkata">
                    <option value="Asia/Kolkata">India Standard Time (GMT+5:30)</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">{t('settings.date_format')}</Label>
                  <Select id="dateFormat" defaultValue="DD/MM/YYYY">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{t('settings.compact_mode')}</span>
                  <input type="checkbox" className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}