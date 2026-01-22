import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Lock, FileText, AlertTriangle, CheckCircle, XCircle, Eye, Download } from 'lucide-react';

const SecurityCompliance = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [dataAccessLogs, setDataAccessLogs] = useState([]);
  const [complianceFlags, setComplianceFlags] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audit-logs');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'audit-logs') {
        const response = await axios.get('/api/admin/audit-logs');
        setAuditLogs(response.data.data || []);
      } else if (activeTab === 'login-history') {
        const response = await axios.get('/api/admin/login-history');
        setLoginHistory(response.data.data || []);
      } else if (activeTab === 'data-access') {
        const response = await axios.get('/api/admin/security/data-access-logs');
        setDataAccessLogs(response.data.data || []);
      } else if (activeTab === 'compliance') {
        const response = await axios.get('/api/admin/security/compliance-flags');
        setComplianceFlags(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      // Use mock data
      if (activeTab === 'audit-logs') {
        setAuditLogs([
          {
            _id: '1',
            userId: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'admin' },
            module: 'admin.users',
            action: 'UPDATE',
            ipAddress: '192.168.1.1',
            severity: 'medium',
            createdAt: new Date()
          }
        ]);
      } else if (activeTab === 'compliance') {
        setComplianceFlags({
          flags: [
            {
              type: 'privacy-consent',
              severity: 'high',
              title: 'Missing Privacy Consent',
              description: '15 users have not provided privacy consent',
              count: 15,
              action: 'Require privacy consent for all users'
            },
            {
              type: 'expired-license',
              severity: 'high',
              title: 'Expired Staff Licenses',
              description: '3 staff members have expired licenses',
              count: 3,
              action: 'Review and suspend staff with expired licenses'
            }
          ],
          summary: {
            total: 2,
            high: 2,
            medium: 0,
            low: 0
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security & Compliance</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'audit-logs' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('login-history')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'login-history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Login History
          </button>
          <button
            onClick={() => setActiveTab('data-access')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'data-access' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Data Access Logs
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'compliance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Compliance Flags
          </button>
        </div>
      </div>

      {activeTab === 'audit-logs' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Module</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {log.userId?.firstName} {log.userId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{log.userId?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.module}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{log.ipAddress || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'login-history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Activity Tracking</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {log.userId?.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{log.ipAddress || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-xs">
                      {log.userAgent || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {log.success ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs flex items-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'data-access' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Access Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Module</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Path</th>
                </tr>
              </thead>
              <tbody>
                {dataAccessLogs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {log.userId?.firstName} {log.userId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{log.userId?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.module}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {log.metadata?.path || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && complianceFlags && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Total Flags</div>
              <div className="text-2xl font-bold text-gray-900">{complianceFlags.summary.total}</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
              <div className="text-sm text-red-600 mb-1">High Priority</div>
              <div className="text-2xl font-bold text-red-700">{complianceFlags.summary.high}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
              <div className="text-sm text-yellow-600 mb-1">Medium</div>
              <div className="text-2xl font-bold text-yellow-700">{complianceFlags.summary.medium}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
              <div className="text-sm text-blue-600 mb-1">Low</div>
              <div className="text-2xl font-bold text-blue-700">{complianceFlags.summary.low}</div>
            </div>
          </div>

          {/* Compliance Flags List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GDPR / HIPAA Compliance Flags</h3>
            <div className="space-y-4">
              {complianceFlags.flags.map((flag, idx) => (
                <div key={idx} className={`p-4 border-l-4 rounded-lg ${getSeverityColor(flag.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className={`w-5 h-5 mr-2 ${
                          flag.severity === 'high' ? 'text-red-600' :
                          flag.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <h4 className="font-semibold text-gray-900">{flag.title}</h4>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(flag.severity)}`}>
                          {flag.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{flag.description}</p>
                      <p className="text-xs text-gray-600">
                        <strong>Action Required:</strong> {flag.action}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">{flag.count}</div>
                      <div className="text-xs text-gray-500">affected</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityCompliance;

