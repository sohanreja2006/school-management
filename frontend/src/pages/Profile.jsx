import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, User, Building, Save, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    schoolName: '',
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || '',
        schoolName: user.schoolName || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image Compression Logic
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size initially (e.g. max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image is too large. Max 5MB allowed.' });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const imgElement = document.createElement('img');
      imgElement.src = event.target.result;

      imgElement.onload = (e) => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Resize to max 400px width
        const scaleSize = MAX_WIDTH / e.target.width;
        
        // Only scale if image is larger than MAX_WIDTH
        if (scaleSize < 1) {
          canvas.width = MAX_WIDTH;
          canvas.height = e.target.height * scaleSize;
        } else {
          canvas.width = e.target.width;
          canvas.height = e.target.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG, start at 0.7 quality
        let compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check size (base64 string size is roughly 1.33x the actual bytes)
        // We want it under 100KB -> 100 * 1024 bytes -> ~133333 characters in base64
        const targetSize = 133333; 
        
        if (compressedDataUrl.length > targetSize) {
           // Reduce quality further if still too big
           compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4);
        }

        if (compressedDataUrl.length > targetSize) {
            setStatusMsg({ type: 'error', text: 'Could not compress image under 100KB automatically. Please try a smaller image.' });
            return;
        }

        setStatusMsg({ type: '', text: '' });

        setLogoPreview(compressedDataUrl);
        setLogoBase64(compressedDataUrl);
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { ...formData };
      if (logoBase64) {
        updateData.logo = logoBase64;
      }
      
      await updateProfile(updateData);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal and institution details</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-lg text-sm font-medium ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {statusMsg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left: Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group cursor-pointer">
                <div className="w-40 h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-blue-50/50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="School Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium">Upload Logo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-center">
                 <p className="text-xs text-gray-500 font-medium">Max size: 5MB</p>
                 <p className="text-[10px] text-gray-400">Auto-compressed to &lt;100KB</p>
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="flex-1 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Enter school/college name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    Role / Title
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="principal">Principal</option>
                    <option value="manager">Manager</option>
                    <option value="director">Director</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Email (Read Only)
                  </label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
