import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, QrCode, Save, Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    upiId: '',
    qrCodeUrl: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/school/payment-settings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (data.success) {
          setFormData({
            upiId: data.data.upi_id || '',
            qrCodeUrl: data.data.qr_code_url || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/school/payment-settings', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Payment Settings</h1>
        <p className="text-secondary-500 font-medium mt-1">Configure how parents pay fees to your school.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary-500" />
                  School UPI ID
                </label>
                <input 
                  type="text"
                  placeholder="e.g. schoolname@upi"
                  value={formData.upiId}
                  onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                  className="w-full px-5 py-3.5 bg-secondary-50 border border-secondary-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary-700 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary-500" />
                  Payment QR Code URL
                </label>
                <input 
                  type="text"
                  placeholder="Link to your uploaded QR image"
                  value={formData.qrCodeUrl}
                  onChange={(e) => setFormData({...formData, qrCodeUrl: e.target.value})}
                  className="w-full px-5 py-3.5 bg-secondary-50 border border-secondary-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                />
                <p className="text-xs text-secondary-400 mt-1">Upload your QR code to a service like Cloudinary or ImgBB and paste the link here.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 gap-2 shadow-lg shadow-primary-500/20"
                disabled={loading}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Payment Settings'}
              </Button>

              {message && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center font-bold text-sm border border-emerald-100 animate-in fade-in zoom-in duration-300">
                  {message}
                </div>
              )}
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-primary-50 border-primary-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-primary-900">How it works</h4>
                <p className="text-xs text-primary-700 leading-relaxed">
                  Parents will see this QR code and UPI ID in their mobile app when they tap "Pay Fees".
                </p>
                <p className="text-xs text-primary-700 leading-relaxed">
                  After scanning and paying, they will submit their Transaction ID for your verification.
                </p>
              </div>
            </div>
          </Card>

          {formData.qrCodeUrl && (
            <Card className="p-4 flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-4">Live Preview</p>
              <img src={formData.qrCodeUrl} alt="Preview" className="w-40 h-40 object-contain rounded-lg border border-secondary-100" />
              <p className="mt-3 text-sm font-bold text-secondary-900">{formData.upiId}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
