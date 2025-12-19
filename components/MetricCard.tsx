interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {trend && <p className="mt-1 text-xs text-green-600 font-medium">{trend}</p>}
        </div>
        {icon && <div className="ml-4 text-blue-500">{icon}</div>}
      </div>
    </div>
  );
}
