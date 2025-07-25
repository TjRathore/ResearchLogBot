import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Settings as SettingsIcon, Webhook, Bot } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bot Settings</h2>
            <p className="text-gray-600">Configure your Telegram and Slack bot connections</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Slack Bot</h4>
                    <p className="text-sm text-gray-600">Connected to workspace</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Telegram Bot</h4>
                    <p className="text-sm text-gray-600">Bot token configured</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slack Configuration */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Slack Configuration</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="slack-token">Bot Token</Label>
              <Input
                id="slack-token"
                type="password"
                placeholder="xoxb-your-slack-bot-token"
                defaultValue="••••••••••••••••••••••••••••••••••••••••"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your Slack bot token from the app settings
              </p>
            </div>
            
            <div>
              <Label htmlFor="slack-channel">Default Channel ID</Label>
              <Input
                id="slack-channel"
                placeholder="C1234567890"
                defaultValue="C084HL619LG"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Channel ID where the bot will be active
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-process Messages</Label>
                <p className="text-sm text-gray-500">Automatically extract knowledge from new messages</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <Webhook className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Webhook URL:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {window.location.origin}/api/slack/events
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Configuration */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Telegram Configuration</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="telegram-token">Bot Token</Label>
              <Input
                id="telegram-token"
                type="password"
                placeholder="1234567890:ABCDEF..."
                defaultValue="••••••••••••••••••••••••••••••••••••••••"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your Telegram bot token from @BotFather
              </p>
            </div>
            
            <div>
              <Label htmlFor="telegram-chat">Chat ID</Label>
              <Input
                id="telegram-chat"
                placeholder="-1001234567890"
                defaultValue="-1001234567890"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Chat ID where the bot will monitor messages
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Command Responses</Label>
                <p className="text-sm text-gray-500">Respond to /ask and /search commands</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <Webhook className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Webhook URL:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {window.location.origin}/api/telegram/webhook
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI Configuration */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Configuration</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                defaultValue="••••••••••••••••••••••••••••••••••••••••"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your OpenAI API key for GPT-4o and embeddings
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                <Input
                  id="confidence-threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum confidence for auto-validation
                </p>
              </div>
              
              <div>
                <Label htmlFor="max-tokens">Max Response Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  min="100"
                  max="2000"
                  defaultValue="500"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum tokens for bot responses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Settings */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Processing Settings</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Real-time Processing</Label>
                <p className="text-sm text-gray-500">Process messages as they arrive</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-validation</Label>
                <p className="text-sm text-gray-500">Automatically validate high-confidence extractions</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Command Logging</Label>
                <p className="text-sm text-gray-500">Log all bot commands and responses</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div>
              <Label htmlFor="batch-size">Batch Processing Size</Label>
              <Input
                id="batch-size"
                type="number"
                min="1"
                max="100"
                defaultValue="10"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of messages to process in each batch
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-blue-500 hover:bg-blue-600">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
