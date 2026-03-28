import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import { handleApiError } from '../../services/api';
import {
  Database,
  Eye,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const MyFarmData = () => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchFarmData();
  }, []);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getMyReports();
      setFarmData(response.data.report);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const getDataCompleteness = () => {
    if (!farmData?.dataSummary) return 0;
    
    const totalTables = Object.keys(farmData.dataSummary).length;
    const tablesWithData = Object.values(farmData.dataSummary).filter(count => count > 0).length;
    
    return Math.round((tablesWithData / totalTables) * 100);
  };

  const getRecentActivity = () => {
    if (!farmData?.farmData) return [];
    
    const allRecords = [];
    Object.entries(farmData.farmData).forEach(([table, records]) => {
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

  const getTableDisplayName = (tableKey) => {
    return tableKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTableIcon = (tableKey) => {
    if (tableKey.includes('crop')) return BarChart3;
    if (tableKey.includes('livestock')) return TrendingUp;
    if (tableKey.includes('equipment')) return Database;
    return Database;
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
        <div className="text-red-800">Error loading farm data: {error}</div>
      </div>
    );
  }

  const completeness = getDataCompleteness();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Farm Data</h1>
        <p className="text-gray-600">View all your farm information and records</p>
      </div>

      {/* Farmer Info Card */}
      {farmData?.farmer && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{farmData.farmer.name}</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {farmData.farmer.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Registered: {new Date(farmData.farmer.registration_date).toLocaleDateString()}
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
                {farmData?.summary?.totalRecords || 0}
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
                {Object.values(farmData?.dataSummary || {}).filter(count => count > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
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

      {/* Data Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {farmData?.dataSummary && Object.entries(farmData.dataSummary).map(([table, count]) => {
          const TableIcon = getTableIcon(table);
          const hasData = count > 0;
          
          return (
            <div key={table} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      hasData ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <TableIcon className={`w-4 h-4 ${hasData ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {getTableDisplayName(table)}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hasData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hasData ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {hasData ? `${count} records` : 'No data'}
                    </span>
                    <button
                      onClick={() => setSelectedTable(selectedTable === table ? null : table)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expanded Table Details */}
              {selectedTable === table && farmData?.farmData?.[table] && (
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    {farmData.farmData[table].length > 0 ? (
                      <div className="space-y-4">
                        {farmData.farmData[table].map((record, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {record.crop_name || record.equipment_name || record.animal_type || `Record #${index + 1}`}
                              </h4>
                              <div className="text-xs text-gray-500">
                                Updated: {new Date(record.updated_at || record.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(record)
                                .filter(([key]) => key !== 'id' && key !== 'farmer_id' && key !== 'created_at' && key !== 'updated_at')
                                .map(([key, value]) => (
                                  <div key={key} className="flex">
                                    <span className="text-gray-500 mr-2">
                                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                    </span>
                                    <span className="text-gray-900">{value || 'N/A'}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No records found in this category
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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

      {/* Data Request Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Need to update your information?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Contact your assigned auditor to request changes to your farm data. Farmers have view-only access for security purposes.
            </p>
            <div className="mt-3">
              <p className="text-xs text-blue-600">
                <strong>Note:</strong> All data changes must be verified and approved by authorized auditors to maintain data integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFarmData;
