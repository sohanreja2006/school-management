const supabase = require('../config/supabase');

// @desc    Update driver location
// @route   POST /api/tracking/location
// @access  Public (or protected by driver token)
exports.updateLocation = async (req, res) => {
  try {
    const { vehicle_id, school_id, latitude, longitude, heading, speed } = req.body;

    if (!vehicle_id || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Missing required location data' });
    }

    // Upsert the location based on vehicle_id
    const { data, error } = await supabase
      .from('vehicle_locations')
      .upsert({
        vehicle_id,
        school_id: school_id || null, // Optional for pure driver app without auth yet
        latitude,
        longitude,
        heading,
        speed,
        updated_at: new Date()
      }, { onConflict: 'vehicle_id' })
      .select();

    if (error) {
      if (error.code === '42P01') {
        throw new Error('Table "vehicle_locations" does not exist in Supabase. Please create it.');
      }
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Update Location Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all active vehicle locations for a school
// @route   GET /api/tracking/locations
// @access  Private
exports.getLocations = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const { data, error } = await supabase
      .from('vehicle_locations')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
        // Handle native Postgres missing table OR PostgREST schema cache missing table
        if (error.code === '42P01' || error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
            return res.status(200).json({ success: true, data: [] });
        }
        throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Driver Login
// @route   POST /api/tracking/driver-login
// @access  Public
exports.driverLogin = async (req, res) => {
  try {
    const { vehicle_number, driver_key } = req.body;

    if (!vehicle_number || !driver_key) {
      return res.status(400).json({ success: false, message: 'Vehicle number and Driver Key are required' });
    }

    const cleanVehicle = vehicle_number.trim();
    const cleanKey = driver_key.trim();

    const { data, error } = await supabase
      .from('transport_routes')
      .select('*')
      .ilike('vehicle_number', cleanVehicle)
      .eq('driver_key', cleanKey)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'Invalid Vehicle Number or Driver Key' });
    }

    // Return success, frontend will use AsyncStorage to keep logged in
    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      data: {
        vehicle_id: data.vehicle_number,
        school_id: data.school_id,
        driver_name: data.driver_name
      }
    });
  } catch (err) {
    console.error('Driver Login Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
