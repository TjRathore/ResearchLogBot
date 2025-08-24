export default function SimpleDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Research Bot Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Pairs</h3>
          <p className="text-3xl font-bold text-blue-600">Loading...</p>
          <p className="text-sm text-gray-600">Total extracted pairs</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Processed</h3>
          <p className="text-3xl font-bold text-green-600">Loading...</p>
          <p className="text-sm text-gray-600">From Slack & Telegram</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Score</h3>
          <p className="text-3xl font-bold text-purple-600">Loading...</p>
          <p className="text-sm text-gray-600">Average confidence</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Backend Server</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Running</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Database Connection</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">n8n Integration</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Fallback Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}