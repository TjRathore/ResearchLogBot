import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const filteredMessages = (messages as any[] || []).filter((message: any) => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "all" || message.platform === platformFilter;
    
    return matchesSearch && matchesPlatform;
  }) || [];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <p className="text-gray-600">Monitor incoming messages from Slack and Telegram</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {(messages as any[] || []).length === 0 
                  ? "No messages received yet. Make sure your bots are properly configured and connected."
                  : "No messages match your current filters."
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message: any) => (
                    <TableRow key={message.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {message.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            message.platform === 'slack' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {message.platform}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {message.channelId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {message.userId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={message.processed ? "default" : "secondary"}>
                          {message.processed ? "Processed" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {filteredMessages.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Showing {filteredMessages.length} of {(messages as any[] || []).length} messages
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
