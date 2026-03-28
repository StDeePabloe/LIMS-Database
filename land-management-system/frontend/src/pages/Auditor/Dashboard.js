import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmerService, reportService } from '../../services/api';
import { handleApiError } from '../../services/api';
import {
  Farmer,
  Database,
  FileText,
  TrendingUp,
  Activity,
  Plus,
  Eye,
  Edit,
  Calendar,
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';

const AuditorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentFarmers, setRecentFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch farmers
      const farmersResponse = await farmerService.getAllFarmers({ limit: 5, sort: 'created_at', order: 'desc' });
      
      // Calculate stats from farmers data
      const farmersCount = farmersResponse.data.pagination?.total || 0;
      
      setStats({
        totalFarmers: farmersCount,
        recentEntries: 0, // This would come from actual data entries
        pendingReports: 0, // This would come from pending assessments
        completedThisMonth: 0, // This would be calculated from assessment data
      });
      
      setRecentFarmers(farmersResponse.data.farmers || []);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (registrationDate) => {
    const daysSinceRegistration = Math.floor((new Date() - new Date(registrationDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceRegistration <= 7) {
      return { color: 'bg-green-100 text-green-800', text: 'New', icon: CheckCircle };
    } else if (daysSinceRegistration <= 30) {
      return { color: 'bg-blue-100 text-blue-800', text: 'Active', icon: Activity };
    } else {
      return { color: 'bg-gray-100 text-gray-800', text: 'Registered', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading dashboard: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditor Dashboard</h1>
        <p className="text-gray-600">Manage farmer data and generate assessment reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Farmer className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Farmers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalFarmers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.recentEntries || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingReports || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedThisMonth || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/auditor/farmers"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Farmer className="w-5 h-5 mr-2" />
              Manage Farmers
            </Link>
            <Link
              to="/auditor/data-entry"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Database className="w-5 h-5 mr-2" />
              Data Entry
            </Link>
            <Link
              to="/auditor/reports"
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Generate Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Farmers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Farmers</h2>
          <Link
            to="/auditor/farmers"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentFarmers.map((farmer) => {
                const status = getStatusBadge(farmer.registration_date);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={farmer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Farmer className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                          <div className="text-sm text-gray-500">{farmer.contact_number || 'No contact'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {farmer.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(farmer.registration_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/auditor/data-entry/${farmer.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Enter Data"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/auditor/reports?farmer=${farmer.id}`}
                          className="text-green-600 hover:text-green-900"
                          title="Generate Report"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <button
                          className="text-orange-600 hover:text-orange-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentFarmers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent farmers found
            </div>
          )}
        </div>
      </div>

      {/* Add New Farmer Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Need to add a new farmer?</h3>
            <p className="text-sm text-gray-600">Register new farmers to start collecting their data</p>
          </div>
          <Link
            to="/auditor/farmers"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Farmer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
