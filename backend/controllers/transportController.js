const supabase = require('../config/supabase');

// @desc    Get all routes
// @route   GET /api/transport
exports.getRoutes = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    
    // Using Supabase
    const { data, error } = await supabase
      .from('transport_routes')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, return empty array gracefully
        return res.status(200).json({ success: true, data: [] });
      }
      throw error;
    }

    // Map snake_case to camelCase for frontend compatibility
    const formattedData = data.map(route => ({
      id: route.id,
      routeName: route.route_name,
      vehicleNumber: route.vehicle_number,
      driverName: route.driver_name,
      driverContact: route.driver_contact,
      driverKey: route.driver_key,
      status: route.status
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Get Routes Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add a route
// @route   POST /api/transport
exports.addRoute = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { routeName, vehicleNumber, driverName, driverContact } = req.body;

    const driverKey = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit PIN

    const { data, error } = await supabase
      .from('transport_routes')
      .insert({
        school_id: schoolId,
        route_name: routeName,
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        driver_contact: driverContact,
        driver_key: driverKey,
        status: 'Active'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        throw new Error('Database Error: Missing "transport_routes" table. Please run this in Supabase SQL editor: CREATE TABLE transport_routes (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, school_id UUID, route_name TEXT, vehicle_number TEXT, driver_name TEXT, driver_contact TEXT, driver_key TEXT, status TEXT DEFAULT \'Active\');');
      }
      if (error.code === '42703') {
        throw new Error('Database Error: Missing "driver_key" column. Please run this in Supabase SQL editor: ALTER TABLE transport_routes ADD COLUMN driver_key TEXT;');
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Add Route Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a route
// @route   PUT /api/transport/:id
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { routeName, vehicleNumber, driverName, driverContact, driverKey } = req.body;
    
    // Auto-generate key if requested to reset, or keep existing/updated
    let finalKey = driverKey;
    if (req.body.resetKey) {
      finalKey = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const { data, error } = await supabase
      .from('transport_routes')
      .update({
        route_name: routeName,
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        driver_contact: driverContact,
        ...(finalKey && { driver_key: finalKey })
      })
      .eq('id', id)
      .eq('school_id', req.user.schoolId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a route
// @route   DELETE /api/transport/:id
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transport_routes')
      .delete()
      .eq('id', id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
