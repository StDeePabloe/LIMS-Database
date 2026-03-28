import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerService, farmDataService } from '../../services/api';
import { handleApiError } from '../../services/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Database,
  Save,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

const DataEntry = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [farmData, setFarmData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Define all available tables and their fields
  const availableTables = {
    administrative_information: {
      name: 'Administrative Information',
      fields: [
        { name: 'province', label: 'Province', type: 'text', required: true },
        { name: 'district', label: 'District', type: 'text', required: true },
        { name: 'ward', label: 'Ward', type: 'text', required: true },
        { name: 'village', label: 'Village', type: 'text', required: true },
        { name: 'farm_name', label: 'Farm Name', type: 'text' },
        { name: 'ownership_type', label: 'Ownership Type', type: 'select', options: ['Private', 'Cooperative', 'Government', 'Other'] },
        { name: 'registration_number', label: 'Registration Number', type: 'text' },
        { name: 'tax_clearance', label: 'Tax Clearance', type: 'checkbox' },
      ]
    },
    farm_identification: {
      name: 'Farm Identification',
      fields: [
        { name: 'total_area_hectares', label: 'Total Area (hectares)', type: 'number', required: true },
        { name: 'cultivated_area_hectares', label: 'Cultivated Area (hectares)', type: 'number', required: true },
        { name: 'uncultivated_area_hectares', label: 'Uncultivated Area (hectares)', type: 'number' },
        { name: 'soil_type', label: 'Soil Type', type: 'select', options: ['Clay', 'Loam', 'Sand', 'Silt', 'Other'] },
        { name: 'topography', label: 'Topography', type: 'select', options: ['Flat', 'Sloping', 'Hilly', 'Mountainous'] },
        { name: 'water_access', label: 'Water Access', type: 'checkbox' },
        { name: 'electricity_access', label: 'Electricity Access', type: 'checkbox' },
        { name: 'road_access', label: 'Road Access', type: 'select', options: ['Good', 'Fair', 'Poor'] },
        { name: 'gps_coordinates', label: 'GPS Coordinates', type: 'text' },
      ]
    },
    farm_infrastructure: {
      name: 'Farm Infrastructure',
      fields: [
        { name: 'building_type', label: 'Building Type', type: 'select', options: ['Permanent', 'Semi-permanent', 'Temporary'] },
        { name: 'building_condition', label: 'Building Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { name: 'number_of_buildings', label: 'Number of Buildings', type: 'number' },
        { name: 'storage_facilities', label: 'Storage Facilities', type: 'checkbox' },
        { name: 'fencing_type', label: 'Fencing Type', type: 'select', options: ['None', 'Wire', 'Wood', 'Concrete', 'Other'] },
        { name: 'fencing_length_km', label: 'Fencing Length (km)', type: 'number' },
        { name: 'gates_count', label: 'Number of Gates', type: 'number' },
      ]
    },
    equipment: {
      name: 'Equipment',
      fields: [
        { name: 'equipment_type', label: 'Equipment Type', type: 'select', options: ['Tractor', 'Plow', 'Harrow', 'Planter', 'Harvester', 'Irrigation', 'Other'] },
        { name: 'equipment_name', label: 'Equipment Name', type: 'text', required: true },
        { name: 'brand', label: 'Brand', type: 'text' },
        { name: 'model', label: 'Model', type: 'text' },
        { name: 'year_manufactured', label: 'Year Manufactured', type: 'number' },
        { name: 'condition', label: 'Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { name: 'ownership_status', label: 'Ownership Status', type: 'select', options: ['Owned', 'Rented', 'Leased'] },
        { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
        { name: 'current_value', label: 'Current Value', type: 'number' },
      ]
    },
    crop_production_summer: {
      name: 'Crop Production - Summer',
      fields: [
        { name: 'crop_name', label: 'Crop Name', type: 'text', required: true },
        { name: 'variety', label: 'Variety', type: 'text' },
        { name: 'planting_date', label: 'Planting Date', type: 'date', required: true },
        { name: 'expected_harvest_date', label: 'Expected Harvest Date', type: 'date' },
        { name: 'area_planted_hectares', label: 'Area Planted (hectares)', type: 'number', required: true },
        { name: 'expected_yield_tons', label: 'Expected Yield (tons)', type: 'number' },
        { name: 'actual_yield_tons', label: 'Actual Yield (tons)', type: 'number' },
        { name: 'fertilizer_used', label: 'Fertilizer Used', type: 'text' },
        { name: 'pest_control_method', label: 'Pest Control Method', type: 'text' },
        { name: 'irrigation_method', label: 'Irrigation Method', type: 'select', options: ['None', 'Drip', 'Sprinkler', 'Flood', 'Other'] },
        { name: 'market_destination', label: 'Market Destination', type: 'text' },
      ]
    },
    crop_production_winter: {
      name: 'Crop Production - Winter',
      fields: [
        { name: 'crop_name', label: 'Crop Name', type: 'text', required: true },
        { name: 'variety', label: 'Variety', type: 'text' },
        { name: 'planting_date', label: 'Planting Date', type: 'date', required: true },
        { name: 'expected_harvest_date', label: 'Expected Harvest Date', type: 'date' },
        { name: 'area_planted_hectares', label: 'Area Planted (hectares)', type: 'number', required: true },
        { name: 'expected_yield_tons', label: 'Expected Yield (tons)', type: 'number' },
        { name: 'actual_yield_tons', label: 'Actual Yield (tons)', type: 'number' },
        { name: 'fertilizer_used', label: 'Fertilizer Used', type: 'text' },
        { name: 'pest_control_method', label: 'Pest Control Method', type: 'text' },
        { name: 'irrigation_method', label: 'Irrigation Method', type: 'select', options: ['None', 'Drip', 'Sprinkler', 'Flood', 'Other'] },
        { name: 'market_destination', label: 'Market Destination', type: 'text' },
      ]
    },
    crop_production_horticulture: {
      name: 'Crop Production - Horticulture',
      fields: [
        { name: 'crop_name', label: 'Crop Name', type: 'text', required: true },
        { name: 'variety', label: 'Variety', type: 'text' },
        { name: 'planting_date', label: 'Planting Date', type: 'date', required: true },
        { name: 'expected_harvest_date', label: 'Expected Harvest Date', type: 'date' },
        { name: 'area_planted_hectares', label: 'Area Planted (hectares)', type: 'number', required: true },
        { name: 'expected_yield_tons', label: 'Expected Yield (tons)', type: 'number' },
        { name: 'actual_yield_tons', label: 'Actual Yield (tons)', type: 'number' },
        { name: 'greenhouse', label: 'Greenhouse', type: 'checkbox' },
        { name: 'fertilizer_used', label: 'Fertilizer Used', type: 'text' },
        { name: 'pest_control_method', label: 'Pest Control Method', type: 'text' },
        { name: 'irrigation_method', label: 'Irrigation Method', type: 'select', options: ['None', 'Drip', 'Sprinkler', 'Flood', 'Other'] },
        { name: 'market_destination', label: 'Market Destination', type: 'text' },
      ]
    },
    livestock_production: {
      name: 'Livestock Production',
      fields: [
        { name: 'animal_type', label: 'Animal Type', type: 'select', options: ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs', 'Other'] },
        { name: 'breed', label: 'Breed', type: 'text', required: true },
        { name: 'number_of_animals', label: 'Number of Animals', type: 'number', required: true },
        { name: 'age_range', label: 'Age Range', type: 'select', options: ['Young', 'Adult', 'Mixed'] },
        { name: 'health_status', label: 'Health Status', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { name: 'vaccination_status', label: 'Vaccination Status', type: 'checkbox' },
        { name: 'feeding_method', label: 'Feeding Method', type: 'select', options: ['Free-range', 'Semi-intensive', 'Intensive'] },
        { name: 'housing_type', label: 'Housing Type', type: 'select', options: ['Open', 'Semi-closed', 'Closed'] },
        { name: 'production_type', label: 'Production Type', type: 'select', options: ['Meat', 'Milk', 'Eggs', 'Mixed'] },
        { name: 'annual_production', label: 'Annual Production', type: 'number' },
      ]
    },
    irrigation_facilities: {
      name: 'Irrigation Facilities',
      fields: [
        { name: 'irrigation_type', label: 'Irrigation Type', type: 'select', options: ['Drip', 'Sprinkler', 'Flood', 'Center Pivot', 'Other'] },
        { name: 'water_source', label: 'Water Source', type: 'select', options: ['Borehole', 'River', 'Dam', 'Well', 'Municipal'] },
        { name: 'pump_type', label: 'Pump Type', type: 'select', options: ['Electric', 'Diesel', 'Solar', 'Manual'] },
        { name: 'pump_capacity_liters_per_hour', label: 'Pump Capacity (liters/hour)', type: 'number' },
        { name: 'pipe_length_meters', label: 'Pipe Length (meters)', type: 'number' },
        { name: 'coverage_area_hectares', label: 'Coverage Area (hectares)', type: 'number' },
        { name: 'installation_date', label: 'Installation Date', type: 'date' },
        { name: 'last_maintenance_date', label: 'Last Maintenance Date', type: 'date' },
        { name: 'condition', label: 'Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      ]
    },
    overall_assessment: {
      name: 'Overall Assessment',
      fields: [
        { name: 'assessment_date', label: 'Assessment Date', type: 'date', required: true },
        { name: 'overall_score', label: 'Overall Score', type: 'number', min: 0, max: 100 },
        { name: 'productivity_rating', label: 'Productivity Rating', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { name: 'sustainability_rating', label: 'Sustainability Rating', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { name: 'compliance_status', label: 'Compliance Status', type: 'select', options: ['Compliant', 'Partially Compliant', 'Non-compliant'] },
        { name: 'recommendations', label: 'Recommendations', type: 'textarea' },
        { name: 'next_assessment_date', label: 'Next Assessment Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: ['pending', 'completed', 'reviewed'] },
      ]
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, [farmerId]);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      
      // Fetch farmer information
      const farmerResponse = await farmerService.getFarmerById(farmerId);
      setFarmer(farmerResponse.data.farmer);
      
      // Fetch farm data
      const dataResponse = await farmDataService.getFarmData(farmerId);
      setFarmData(dataResponse.data.data);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (data) => {
    try {
      setSubmitting(true);
      await farmDataService.createFarmData(farmerId, selectedTable, data);
      toast.success('Record created successfully');
      setShowCreateForm(false);
      reset();
      fetchFarmerData();
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRecord = async (data) => {
    try {
      setSubmitting(true);
      await farmDataService.updateFarmData(farmerId, selectedTable, editingRecord.id, data);
      toast.success('Record updated successfully');
      setEditingRecord(null);
      reset();
      fetchFarmerData();
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (table, recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await farmDataService.deleteFarmData(farmerId, table, recordId);
      toast.success('Record deleted successfully');
      fetchFarmerData();
    } catch (error) {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
    }
  };

  const openCreateForm = (table) => {
    setSelectedTable(table);
    setShowCreateForm(true);
    setEditingRecord(null);
    reset();
  };

  const openEditForm = (table, record) => {
    setSelectedTable(table);
    setEditingRecord(record);
    setShowCreateForm(true);
    
    // Populate form with existing data
    Object.keys(record).forEach(key => {
      if (key !== 'id' && key !== 'farmer_id' && key !== 'created_at' && key !== 'updated_at') {
        setValue(key, record[key]);
      }
    });
  };

  const renderFormField = (field) => {
    const commonProps = {
      ...register(field.name, { required: field.required }),
      className: "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            {...register(field.name)}
            type="checkbox"
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        );
      case 'textarea':
        return (
          <textarea
            {...register(field.name, { required: field.required })}
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        );
      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            min={field.min}
            max={field.max}
          />
        );
    }
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
        <div className="text-red-800">Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/auditor/farmers')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Farmers
          </button>
        </div>
        {farmer && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">{farmer.name}</h2>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {farmer.location}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
        )}
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(availableTables).map(([tableKey, tableInfo]) => {
          const records = farmData[tableKey] || [];
          const hasData = records.length > 0;
          
          return (
            <div key={tableKey} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{tableInfo.name}</h3>
                <div className="flex items-center space-x-2">
                  {hasData && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {records.length} records
                    </span>
                  )}
                  <button
                    onClick={() => openCreateForm(tableKey)}
                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {hasData ? (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div key={record.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {record.crop_name || record.equipment_name || record.animal_type || `Record #${record.id}`}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditForm(tableKey, record)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(tableKey, record.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(record.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No data recorded</p>
                    <p className="text-sm mt-1">Click "Add" to start entering data</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Entry Modal */}
      {showCreateForm && selectedTable && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCreateForm(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRecord ? 'Edit' : 'Add'} {availableTables[selectedTable].name}
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(editingRecord ? handleUpdateRecord : handleCreateRecord)}>
                <div className="space-y-4">
                  {availableTables[selectedTable].fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFormField(field)}
                      {errors[field.name] && (
                        <p className="mt-1 text-sm text-red-600">{field.label} is required</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingRecord ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEntry;
