import { Link, useLocation } from "wouter";
import { Brain, MessageSquare, Search, Settings, BarChart3, Bot, TrendingUp } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Overview", icon: BarChart3 },
    { href: "/knowledge-pairs", label: "Knowledge Pairs", icon: Brain },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/search", label: "Search & Query", icon: Search },
    { href: "/settings", label: "Bot Settings", icon: Settings },
  ];

  return (
    <div className="bg-white shadow-lg w-64 p-6 flex-shrink-0">
      <div className="flex items-center mb-8">
        <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
          <Bot className="text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Research Bot</h1>
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
