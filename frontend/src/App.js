import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Activity, TrendingUp, AlertCircle, Database, MessageSquare, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [streamData, setStreamData] = useState([]);
  const [aggregates, setAggregates] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, aggRes, alertRes, docRes, statsRes] = await Promise.all([
          axios.get(`${API}/stream/data`),
          axios.get(`${API}/stream/aggregates`),
          axios.get(`${API}/stream/alerts`),
          axios.get(`${API}/documents`),
          axios.get(`${API}/stats`)
        ]);
        
        setStreamData(dataRes.data.data || []);
        setAggregates(aggRes.data.aggregates || {});
        setAlerts(alertRes.data.alerts || []);
        setDocuments(docRes.data || []);
        setStats(statsRes.data || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsQuerying(true);
    try {
      const response = await axios.post(`${API}/query`, {
        question: query
      });
      setQueryResponse(response.data);
      toast.success("Query processed successfully");
    } catch (error) {
      console.error("Query error:", error);
      toast.error("Failed to process query");
    } finally {
      setIsQuerying(false);
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-emerald-400";
    if (change < 0) return "text-rose-400";
    return "text-gray-400";
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="flex items-center gap-3">
            <div className="logo-icon">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="header-title">Pathway Financial Intelligence</h1>
              <p className="header-subtitle">Real-Time AI-Powered Market Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="status-badge">
              <div className="status-dot" />
              Live Stream Active
            </Badge>
            <Badge variant="secondary">{stats.total_alerts || 0} Alerts</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="tabs-list">
            <TabsTrigger value="dashboard" data-testid="dashboard-tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="query" data-testid="query-tab">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Query
            </TabsTrigger>
            <TabsTrigger value="documents" data-testid="documents-tab">
              <FileText className="w-4 h-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="tab-content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Market Overview */}
              <Card className="glass-card lg:col-span-2" data-testid="market-overview-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-400" />
                    Live Market Data
                  </CardTitle>
                  <CardDescription>Real-time streaming market updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {Object.entries(aggregates).map(([symbol, data]) => (
                        <div key={symbol} className="market-item" data-testid={`market-${symbol}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-semibold text-gray-100">{symbol}</div>
                              <div className="text-sm text-gray-400">Vol: {(data.volume / 1000000).toFixed(1)}M</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-100">${data.current}</div>
                              <div className="text-sm text-gray-400">Avg: ${data.avg}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs mt-2">
                            <span className="text-gray-400">Low: ${data.min}</span>
                            <div className="flex-1 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full" />
                            <span className="text-gray-400">High: ${data.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Alerts Panel */}
              <Card className="glass-card" data-testid="alerts-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Real-Time Alerts
                  </CardTitle>
                  <CardDescription>Anomaly detection & signals</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {alerts.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">No alerts detected</div>
                      ) : (
                        alerts.map((alert) => (
                          <div key={alert.id} className="alert-item" data-testid={`alert-${alert.symbol}`}>
                            <div className="flex items-start gap-3">
                              <AlertCircle className={`w-4 h-4 mt-1 ${
                                alert.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-100">{alert.symbol}</div>
                                <div className="text-sm text-gray-400 mt-1">{alert.message}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(alert.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                                {alert.severity}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Stream Data */}
              <Card className="glass-card lg:col-span-3" data-testid="stream-data-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    Live Data Stream
                  </CardTitle>
                  <CardDescription>Latest transactions ({streamData.length} data points)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {streamData.slice(-12).reverse().map((item, idx) => (
                        <div key={idx} className="stream-item" data-testid={`stream-${item.symbol}-${idx}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-100">{item.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-gray-100">${item.price}</span>
                            <span className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Vol: {(item.volume / 1000000).toFixed(2)}M</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Query Tab */}
          <TabsContent value="query" className="tab-content">
            <Card className="glass-card" data-testid="query-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                  AI-Powered Financial Query
                </CardTitle>
                <CardDescription>
                  Ask questions about market data, trends, or financial concepts using RAG
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      data-testid="query-input"
                      placeholder="Ask about market trends, risk management, or real-time alerts..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                      className="query-input"
                    />
                    <Button 
                      data-testid="query-submit-btn"
                      onClick={handleQuery} 
                      disabled={isQuerying || !query.trim()}
                      className="query-button"
                    >
                      {isQuerying ? 'Processing...' : 'Ask AI'}
                    </Button>
                  </div>

                  {/* Sample Questions */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-400">Try:</span>
                    {[
                      "What stocks are showing unusual activity?",
                      "Explain market volatility",
                      "What are the current alerts?",
                      "Best risk management strategies?"
                    ].map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(q)}
                        className="sample-query"
                        data-testid={`sample-query-${idx}`}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>

                  {/* Response */}
                  {queryResponse && (
                    <div className="response-container" data-testid="query-response">
                      <div className="response-header">
                        <h3 className="text-lg font-semibold text-gray-100">Response</h3>
                        <Badge variant="secondary">{new Date(queryResponse.timestamp).toLocaleString()}</Badge>
                      </div>
                      <div className="response-content">
                        {queryResponse.answer}
                      </div>
                      {queryResponse.sources.length > 0 && (
                        <div className="response-sources">
                          <span className="text-sm font-medium text-gray-300">Sources:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {queryResponse.sources.map((source, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="tab-content">
            <Card className="glass-card" data-testid="documents-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Knowledge Base
                </CardTitle>
                <CardDescription>
                  Indexed documents for RAG ({documents.length} documents)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="doc-item" data-testid={`doc-${idx}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-100">{doc.title}</h3>
                          <Badge variant="secondary">{doc.category}</Badge>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{doc.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer Stats */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-stat">
            <Database className="w-4 h-4" />
            <span>{stats.data_points || 0} Data Points</span>
          </div>
          <div className="footer-stat">
            <FileText className="w-4 h-4" />
            <span>{stats.total_documents || 0} Documents</span>
          </div>
          <div className="footer-stat">
            <AlertCircle className="w-4 h-4" />
            <span>{stats.total_alerts || 0} Total Alerts</span>
          </div>
          <div className="footer-stat">
            <Activity className="w-4 h-4" />
            <span>Powered by Pathway</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;