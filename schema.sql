-- Land Management System Database Schema
-- PostgreSQL Database

-- Create users table for authentication and authorization
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'auditor', 'farmer')),
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    contact_number VARCHAR(20),
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Administrative Information Table
CREATE TABLE IF NOT EXISTS administrative_information (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    village VARCHAR(100),
    farm_name VARCHAR(200),
    ownership_type VARCHAR(50),
    registration_number VARCHAR(100),
    tax_clearance BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm Identification Table
CREATE TABLE IF NOT EXISTS farm_identification (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    total_area_hectares DECIMAL(10,2),
    cultivated_area_hectares DECIMAL(10,2),
    uncultivated_area_hectares DECIMAL(10,2),
    soil_type VARCHAR(100),
    topography VARCHAR(50),
    water_access BOOLEAN DEFAULT false,
    electricity_access BOOLEAN DEFAULT false,
    road_access VARCHAR(50),
    gps_coordinates VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm Infrastructure Table
CREATE TABLE IF NOT EXISTS farm_infrastructure (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    building_type VARCHAR(100),
    building_condition VARCHAR(50),
    number_of_buildings INTEGER,
    storage_facilities BOOLEAN DEFAULT false,
    fencing_type VARCHAR(50),
    fencing_length_km DECIMAL(8,2),
    gates_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100),
    equipment_name VARCHAR(200),
    brand VARCHAR(100),
    model VARCHAR(100),
    year_manufactured INTEGER,
    condition VARCHAR(50),
    ownership_status VARCHAR(50), -- owned, rented, leased
    purchase_date DATE,
    current_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Production - Summer Table
CREATE TABLE IF NOT EXISTS crop_production_summer (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    area_planted_hectares DECIMAL(10,2),
    expected_yield_tons DECIMAL(10,2),
    actual_yield_tons DECIMAL(10,2),
    fertilizer_used VARCHAR(200),
    pest_control_method VARCHAR(100),
    irrigation_method VARCHAR(100),
    market_destination VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Production - Winter Table
CREATE TABLE IF NOT EXISTS crop_production_winter (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    area_planted_hectares DECIMAL(10,2),
    expected_yield_tons DECIMAL(10,2),
    actual_yield_tons DECIMAL(10,2),
    fertilizer_used VARCHAR(200),
    pest_control_method VARCHAR(100),
    irrigation_method VARCHAR(100),
    market_destination VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Production - Horticulture Table
CREATE TABLE IF NOT EXISTS crop_production_horticulture (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    area_planted_hectares DECIMAL(10,2),
    expected_yield_tons DECIMAL(10,2),
    actual_yield_tons DECIMAL(10,2),
    greenhouse BOOLEAN DEFAULT false,
    fertilizer_used VARCHAR(200),
    pest_control_method VARCHAR(100),
    irrigation_method VARCHAR(100),
    market_destination VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Livestock Production Table
CREATE TABLE IF NOT EXISTS livestock_production (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    animal_type VARCHAR(100),
    breed VARCHAR(100),
    number_of_animals INTEGER,
    age_range VARCHAR(50),
    health_status VARCHAR(50),
    vaccination_status BOOLEAN DEFAULT false,
    feeding_method VARCHAR(100),
    housing_type VARCHAR(100),
    production_type VARCHAR(100), -- meat, milk, eggs, etc.
    annual_production DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Irrigation Facilities Table
CREATE TABLE IF NOT EXISTS irrigation_facilities (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    irrigation_type VARCHAR(100), -- drip, sprinkler, flood, etc.
    water_source VARCHAR(100), -- borehole, river, dam, etc.
    pump_type VARCHAR(100),
    pump_capacity_liters_per_hour DECIMAL(10,2),
    pipe_length_meters DECIMAL(10,2),
    coverage_area_hectares DECIMAL(10,2),
    installation_date DATE,
    last_maintenance_date DATE,
    condition VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Overall Assessment Table
CREATE TABLE IF NOT EXISTS overall_assessment (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    assessment_date DATE DEFAULT CURRENT_DATE,
    auditor_id INTEGER REFERENCES users(id),
    overall_score DECIMAL(5,2),
    productivity_rating VARCHAR(20),
    sustainability_rating VARCHAR(20),
    compliance_status VARCHAR(20),
    recommendations TEXT,
    next_assessment_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, reviewed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_farmer_id ON users(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmers_name ON farmers(name);
CREATE INDEX IF NOT EXISTS idx_farmers_location ON farmers(location);

-- Create indexes for all farmer_id foreign keys
CREATE INDEX IF NOT EXISTS idx_administrative_info_farmer_id ON administrative_information(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_identification_farmer_id ON farm_identification(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_infrastructure_farmer_id ON farm_infrastructure(farmer_id);
CREATE INDEX IF NOT EXISTS idx_equipment_farmer_id ON equipment(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_summer_farmer_id ON crop_production_summer(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_winter_farmer_id ON crop_production_winter(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_horticulture_farmer_id ON crop_production_horticulture(farmer_id);
CREATE INDEX IF NOT EXISTS idx_livestock_farmer_id ON livestock_production(farmer_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_farmer_id ON irrigation_facilities(farmer_id);
CREATE INDEX IF NOT EXISTS idx_assessment_farmer_id ON overall_assessment(farmer_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_administrative_info_updated_at BEFORE UPDATE ON administrative_information FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_identification_updated_at BEFORE UPDATE ON farm_identification FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_infrastructure_updated_at BEFORE UPDATE ON farm_infrastructure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_summer_updated_at BEFORE UPDATE ON crop_production_summer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_winter_updated_at BEFORE UPDATE ON crop_production_winter FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_horticulture_updated_at BEFORE UPDATE ON crop_production_horticulture FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON livestock_production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_irrigation_updated_at BEFORE UPDATE ON irrigation_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_updated_at BEFORE UPDATE ON overall_assessment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Note: Change this password in production!
INSERT INTO users (name, email, password, role) 
VALUES (
    'System Administrator', 
    'admin@landmanagement.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', -- bcrypt hash of 'admin123'
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
-- Note: Adjust these permissions based on your security requirements
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
