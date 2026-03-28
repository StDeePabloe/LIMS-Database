import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/api';
import { handleApiError } from '../../services/api';
import {
  Database,
  FileText,
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const FarmerDashboard = () => {
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      
      // Fetch farmer's reports
      const reportsResponse = await reportService.getMyReports();
      
      setFarmerData(reportsResponse.data.report);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const getDataCompleteness = () => {
    if (!farmerData?.dataSummary) return 0;
    
    const totalTables = Object.keys(farmerData.dataSummary).length;
    const tablesWithData = Object.values(farmerData.dataSummary).filter(count => count > 0).length;
    
    return Math.round((tablesWithData / totalTables) * 100);
  };

  const getRecentActivity = () => {
    if (!farmerData?.farmData) return [];
    
    const allRecords = [];
    Object.entries(farmerData.farmData).forEach(([table, records]) => {
      records.forEach(record => {
        allRecords.push({
          table: table.replace(/_/g, ' ').toUpperCase(),
          date: record.updated_at || record.created_at,
          action: 'Updated'
        });
      });
    });
    
    return allRecords
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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

  const completeness = getDataCompleteness();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-gray-600">View your farm data and assessment reports</p>
      </div>

      {/* Farmer Info Card */}
      {farmerData?.farmer && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{farmerData.farmer.name}</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {farmerData.farmer.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Registered: {new Date(farmerData.farmer.registration_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Data Completeness</div>
              <div className="text-2xl font-bold text-green-600">{completeness}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {farmerData?.summary?.totalRecords || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tables Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(farmerData?.dataSummary || {}).filter(count => count > 0).length}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {recentActivity.length > 0 
                  ? new Date(recentActivity[0].date).toLocaleDateString()
                  : 'No updates'
                }
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/farmer/my-data"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Database className="w-5 h-5 mr-2" />
              View My Farm Data
            </Link>
            <Link
              to="/farmer/my-reports"
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              View My Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Data Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerData?.dataSummary && Object.entries(farmerData.dataSummary).map(([table, count]) => (
              <div key={table} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${count > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className={`text-sm font-bold ${count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{activity.table}</div>
                      <div className="text-xs text-gray-500">{activity.action}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No recent activity found</p>
              <p className="text-sm mt-1">Your data will appear here once auditors start collecting information</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Need to update your information?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Contact your assigned auditor to request changes to your farm data. Farmers have view-only access for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
