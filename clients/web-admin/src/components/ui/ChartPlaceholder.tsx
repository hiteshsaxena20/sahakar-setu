interface ChartPlaceholderProps {
  height?: number;
  title?: string;
}

export function ChartPlaceholder({ height = 300, title }: ChartPlaceholderProps) {
  return (
    <div className="relative h-full min-h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="text-center p-8">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500">{title || 'Chart placeholder'}</p>
        <p className="text-sm text-gray-400 mt-1">Connect to analytics service to display real data</p>
      </div>
    </div>
  );
}