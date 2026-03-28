import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import { handleApiError } from '../../services/api';
import {
  FileText,
  Download,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Eye,
  TrendingUp
} from 'lucide-react';

const MyReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getMyReports();
      setReportData(response.data.report);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportData) return;
    
    try {
      setDownloading(true);
      // Note: This would need to be implemented on the backend
      // For now, we'll show a message
      toast.error('PDF download for farmers is not yet available. Please contact your auditor.');
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
    } finally {
      setDownloading(false);
    }
  };

  const getDataCompleteness = () => {
    if (!reportData?.dataSummary) return 0;
    
    const totalTables = Object.keys(reportData.dataSummary).length;
    const tablesWithData = Object.values(reportData.dataSummary).filter(count => count > 0).length;
    
    return Math.round((tablesWithData / totalTables) * 100);
  };

  const getTableDisplayName = (tableKey) => {
    return tableKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTableIcon = (tableKey) => {
    if (tableKey.includes('crop')) return BarChart3;
    if (tableKey.includes('livestock')) return TrendingUp;
    if (tableKey.includes('equipment')) return FileText;
    return FileText;
  };

  const getAssessmentStatus = () => {
    if (!reportData?.farmData?.overall_assessment || reportData.farmData.overall_assessment.length === 0) {
      return { status: 'pending', color: 'bg-yellow-100 text-yellow-800', text: 'Assessment Pending' };
    }
    
    const assessment = reportData.farmData.overall_assessment[0];
    return {
      status: assessment.status || 'completed',
      color: assessment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800',
      text: assessment.status === 'completed' ? 'Assessment Completed' : 'Under Review'
    };
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
        <div className="text-red-800">Error loading reports: {error}</div>
      </div>
    );
  }

  const completeness = getDataCompleteness();
  const assessmentStatus = getAssessmentStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-600">View your farm assessment reports and data summaries</p>
      </div>

      {/* Farmer Info Card */}
      {reportData?.farmer && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{reportData.farmer.name}</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {reportData.farmer.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Registered: {new Date(reportData.farmer.registration_date).toLocaleDateString()}
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

      {/* Report Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData?.summary?.totalRecords || 0}
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
              <p className="text-sm font-medium text-gray-600">Data Tables</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(reportData?.dataSummary || {}).filter(count => count > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assessment Status</p>
              <p className="text-sm font-bold text-gray-900">{assessmentStatus.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Assessment Status</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                assessmentStatus.status === 'completed' ? 'bg-green-500' : 
                assessmentStatus.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${assessmentStatus.color}`}>
                {assessmentStatus.text}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </button>
              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
          
          {assessmentStatus.status === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-900">Assessment Pending</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your farm assessment is still being processed by auditors. Please check back later for the complete assessment report.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Categories Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Data Categories</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData?.dataSummary && Object.entries(reportData.dataSummary).map(([table, count]) => {
              const TableIcon = getTableIcon(table);
              const hasData = count > 0;
              
              return (
                <div key={table} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        hasData ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <TableIcon className={`w-4 h-4 ${hasData ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTableDisplayName(table)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hasData ? `${count} records` : 'No data'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      hasData ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && reportData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowPreview(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Farm Assessment Report</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadPDF}
                    disabled={downloading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-6">
                {/* Farmer Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Farmer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{reportData.farmer.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <p className="font-medium">{reportData.farmer.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Contact:</span>
                      <p className="font-medium">{reportData.farmer.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Registration Date:</span>
                      <p className="font-medium">{new Date(reportData.farmer.registration_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Data Summary */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Data Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{completeness}%</div>
                      <div className="text-sm text-blue-700">Data Completeness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{reportData.summary?.totalRecords || 0}</div>
                      <div className="text-sm text-blue-700">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{reportData.summary?.totalTables || 0}</div>
                      <div className="text-sm text-blue-700">Data Tables</div>
                    </div>
                  </div>
                </div>

                {/* Assessment Details */}
                {reportData?.farmData?.overall_assessment && reportData.farmData.overall_assessment.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-900 mb-4">Assessment Details</h3>
                    {reportData.farmData.overall_assessment.map((assessment, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-green-700">Assessment Date:</span>
                          <p className="font-medium text-green-900">
                            {new Date(assessment.assessment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-green-700">Overall Score:</span>
                          <p className="font-medium text-green-900">{assessment.overall_score || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-green-700">Productivity Rating:</span>
                          <p className="font-medium text-green-900">{assessment.productivity_rating || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-green-700">Sustainability Rating:</span>
                          <p className="font-medium text-green-900">{assessment.sustainability_rating || 'N/A'}</p>
                        </div>
                        {assessment.recommendations && (
                          <div className="col-span-2">
                            <span className="text-sm text-green-700">Recommendations:</span>
                            <p className="font-medium text-green-900 mt-1">{assessment.recommendations}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Tables Summary */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-900">Data Records Summary</h4>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(reportData.dataSummary).map(([table, count]) => (
                        <div key={table} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-900">
                            {getTableDisplayName(table)}
                          </span>
                          <span className={`text-sm font-bold ${count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {count} records
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
