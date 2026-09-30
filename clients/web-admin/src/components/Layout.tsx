import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck,
  Award, Calendar, Home, Briefcase, FileText, Building2,
  MessageSquare, BarChart3, Settings, LogOut, Menu, X, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import i18n from '../i18n';

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer', 'trainee', 'employer', 'recruiter'] },
  { name: 'programmes', href: '/programmes', icon: GraduationCap, roles: ['admin', 'ncct_admin', 'institution_admin'] },
  { name: 'nominations', href: '/nominations', icon: ClipboardCheck, roles: ['admin', 'ncct_admin', 'institution_admin'] },
  { name: 'trainees', href: '/trainees', icon: Users, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer'] },
  { name: 'courses', href: '/courses', icon: BookOpen, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer', 'trainee'] },
  { name: 'assessments', href: '/assessments', icon: ClipboardCheck, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer'] },
  { name: 'certificates', href: '/certificates', icon: Award, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer', 'trainee'] },
  { name: 'attendance', href: '/attendance', icon: Calendar, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer'] },
  { name: 'jobs', href: '/jobs', icon: Briefcase, roles: ['admin', 'ncct_admin', 'institution_admin', 'employer', 'recruiter', 'trainee'] },
  { name: 'applications', href: '/applications', icon: FileText, roles: ['admin', 'ncct_admin', 'institution_admin', 'employer', 'recruiter', 'trainee'] },
  { name: 'employers', href: '/employers', icon: Building2, roles: ['admin', 'ncct_admin', 'institution_admin', 'recruiter'] },
  { name: 'chatbot', href: '/chatbot', icon: MessageSquare, roles: ['admin', 'trainee', 'ncct_admin', 'institution_admin', 'trainer'] },
  { name: 'analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'ncct_admin', 'institution_admin'] },
  { name: 'settings', href: '/settings', icon: Settings, roles: ['admin', 'ncct_admin', 'institution_admin', 'trainer', 'trainee', 'employer', 'recruiter'] },
];

export function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userRoles = (user?.roles && user.roles.length > 0 ? user.roles : ['admin', 'ncct_admin']).map(r => r.toLowerCase());
  const isAdmin = userRoles.some(r => ['admin', 'ncct_admin', 'institution_admin'].includes(r));

  const filteredNav = navigation.filter(item => 
    isAdmin || userRoles.some(role => item.roles.map(r => r.toLowerCase()).includes(role))
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Sahakar Setu</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {(() => {
                  const label = t(`navigation.${item.name}`);
                  return label && !label.startsWith('navigation.')
                    ? label
                    : item.name.charAt(0).toUpperCase() + item.name.slice(1);
                })()}
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.roles?.[0] ? user.roles[0].replace('_', ' ') : 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            {/* Language selector */}
            <div className="relative mr-4">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-8"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.firstName || user?.username}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('common.settings')}
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}