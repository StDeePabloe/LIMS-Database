import React, { useState, useEffect } from 'react';
import { farmerService, reportService } from '../../services/api';
import { handleApiError } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Eye
} from 'lucide-react';

const ReportGeneration = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await farmerService.getAllFarmers({ limit: 100 });
      setFarmers(response.data.farmers);
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (farmerId, format = 'json') => {
    if (!farmerId) {
      toast.error('Please select a farmer');
      return;
    }

    try {
      setGenerating(true);
      const response = await reportService.getAssessmentReport(farmerId, { format });
      
      if (format === 'pdf') {
        // Handle PDF download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `farm-assessment-${farmerId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('PDF report downloaded successfully');
      } else {
        setReportData(response.data.report);
        setShowPreview(true);
        toast.success('Report generated successfully');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!selectedFarmer) return;
    
    try {
      setDownloading(true);
      const response = await reportService.getAssessmentReport(selectedFarmer.id, { format: 'pdf' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farm-assessment-${selectedFarmer.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF report downloaded successfully');
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

  const getStatusBadge = (registrationDate) => {
    const daysSinceRegistration = Math.floor((new Date() - new Date(registrationDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceRegistration <= 7) {
      return { color: 'bg-green-100 text-green-800', text: 'New', icon: CheckCircle };
    } else if (daysSinceRegistration <= 30) {
      return { color: 'bg-blue-100 text-blue-800', text: 'Active', icon: CheckCircle };
    } else {
      return { color: 'bg-gray-100 text-gray-800', text: 'Registered', icon: Clock };
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    farmer.location.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Generation</h1>
        <p className="text-gray-600">Generate comprehensive assessment reports for farmers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farmer Selection */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Select Farmer</h2>
          </div>
          
          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Farmers List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFarmers.map((farmer) => {
                  const status = getStatusBadge(farmer.registration_date);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={farmer.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedFarmer?.id === farmer.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                      }`}
                      onClick={() => setSelectedFarmer(farmer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1" />
                              {farmer.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredFarmers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No farmers found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Report Actions</h2>
          </div>
          
          <div className="p-6">
            {selectedFarmer ? (
              <div className="space-y-6">
                {/* Selected Farmer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Farmer</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{selectedFarmer.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedFarmer.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Registered: {new Date(selectedFarmer.registration_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Generate Report Buttons */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Generate Report</h3>
                  
                  <button
                    onClick={() => generateReport(selectedFarmer.id, 'json')}
                    disabled={generating}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    {generating ? 'Generating...' : 'Preview Report'}
                  </button>
                  
                  <button
                    onClick={() => generateReport(selectedFarmer.id, 'pdf')}
                    disabled={generating}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {generating ? 'Generating...' : 'Download PDF'}
                  </button>
                </div>

                {/* Quick Stats */}
                {reportData && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Report Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Data Completeness:</span>
                        <span className="font-medium text-blue-900">{getDataCompleteness()}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Records:</span>
                        <span className="font-medium text-blue-900">{reportData.summary?.totalRecords || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tables:</span>
                        <span className="font-medium text-blue-900">{reportData.summary?.totalTables || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Select a farmer to generate reports</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && reportData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowPreview(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Assessment Report Preview</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadPDF}
                    disabled={downloading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
                      <div className="text-2xl font-bold text-blue-900">{getDataCompleteness()}%</div>
                      <div className="text-sm text-blue-700">Data Completeness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{reportData.summary?.totalRecords || 0}</div>
                      <div className="text-sm text-blue-700">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{reportData.summary?.totalTables || 0}</div>
                      <div className="text-sm text-blue-700">Tables</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Data Tables */}
                {Object.entries(reportData.farmData).map(([table, records]) => (
                  <div key={table} className="border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-md font-medium text-gray-900">
                        {table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                    </div>
                    <div className="p-6">
                      {records.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(records[0])
                                  .filter(key => key !== 'id' && key !== 'farmer_id' && key !== 'created_at' && key !== 'updated_at')
                                  .map(key => (
                                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {records.map((record, index) => (
                                <tr key={index}>
                                  {Object.entries(record)
                                    .filter(([key]) => key !== 'id' && key !== 'farmer_id' && key !== 'created_at' && key !== 'updated_at')
                                    .map(([key, value]) => (
                                      <td key={key} className="px-4 py-2 text-sm text-gray-900">
                                        {value || 'N/A'}
                                      </td>
                                    ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No records found
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;
