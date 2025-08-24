import { useState } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">AI Research Bot Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Knowledge Pairs</h3>
                <p className="text-3xl font-bold text-blue-600">9</p>
                <p className="text-sm text-gray-600">Total extracted pairs</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Messages</h3>
                <p className="text-3xl font-bold text-green-600">15</p>
                <p className="text-sm text-gray-600">Processed from Slack & Telegram</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Quality Score</h3>
                <p className="text-3xl font-bold text-purple-600">87%</p>
                <p className="text-sm text-gray-600">Average confidence</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-xl font-semibold mb-4">Automated Quality Assessment System</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">✓ Multi-layered Quality Assessment</h4>
                  <p className="text-sm text-gray-600">AI analysis + heuristic algorithms</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">✓ Automated Confidence Scoring</h4>
                  <p className="text-sm text-gray-600">Clarity, completeness, accuracy metrics</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">✓ Auto-validation System</h4>
                  <p className="text-sm text-gray-600">High-quality pairs (85%+ confidence)</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">✓ Community Feedback Integration</h4>
                  <p className="text-sm text-gray-600">Stack Overflow-style voting system</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "knowledge-pairs":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Knowledge Pairs</h1>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">How to handle database connection timeout in Node.js?</h3>
                    <p className="text-gray-600 mb-4">
                      Use connection pooling and implement proper timeout handling with retry logic...
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Confidence: 92%</span>
                      <span className="text-sm text-gray-500">✓ Auto-validated</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">High Quality</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center ml-4">
                    <button className="text-green-600 hover:text-green-700">▲</button>
                    <span className="font-semibold">12</span>
                    <button className="text-red-600 hover:text-red-700">▼</button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Best practices for React state management?</h3>
                    <p className="text-gray-600 mb-4">
                      For small apps use useState, for complex state use useReducer or external libraries like Redux...
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Confidence: 88%</span>
                      <span className="text-sm text-gray-500">✓ Auto-validated</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Good Quality</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center ml-4">
                    <button className="text-green-600 hover:text-green-700">▲</button>
                    <span className="font-semibold">8</span>
                    <button className="text-red-600 hover:text-red-700">▼</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "quality":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Quality Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pairs</h3>
                <p className="text-2xl font-bold">9</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Quality</h3>
                <p className="text-2xl font-bold text-blue-600">87.3%</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Auto-Validated</h3>
                <p className="text-2xl font-bold text-green-600">7</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Needs Review</h3>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Quality Distribution</h2>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">4</div>
                  <div className="text-sm text-gray-600">Excellent (90%+)</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">3</div>
                  <div className="text-sm text-gray-600">Good (75-89%)</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">1</div>
                  <div className="text-sm text-gray-600">Fair (60-74%)</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">1</div>
                  <div className="text-sm text-gray-600">Poor (&lt;60%)</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{currentPage}</h1>
            <p>Page content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="bg-white shadow-lg w-64 p-6 flex-shrink-0">
        <div className="flex items-center mb-8">
          <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Research Bot</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {[
            { id: "dashboard", label: "Overview", icon: "📊" },
            { id: "knowledge-pairs", label: "Knowledge Pairs", icon: "🧠" },
            { id: "quality", label: "Quality Dashboard", icon: "📈" },
            { id: "messages", label: "Messages", icon: "💬" },
            { id: "search", label: "Search & Query", icon: "🔍" },
            { id: "settings", label: "Bot Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
                currentPage === item.id
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}