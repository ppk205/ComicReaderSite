import Link from 'next/link';

interface AdminNavProps {
  currentPage: string;
}

export default function AdminNav({ currentPage }: AdminNavProps) {
  const navItems = [
    { href: '/admin', label: 'Dashboard', id: 'dashboard' },
    { href: '/admin/manga', label: 'Manage Manga', id: 'manga' },
    { href: '/admin/users', label: 'Manage Users', id: 'users' },
  ];

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin {currentPage}
          </h1>
          <nav className="flex space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Site
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-1 rounded transition-colors ${
                  item.id === currentPage.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'red';
}

export function StatsCard({ title, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600', 
    purple: 'text-purple-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}
