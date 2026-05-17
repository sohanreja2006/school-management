import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchPendingPayments = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/fees/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (data.success) {
        setPayments(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleVerify = async (id, status) => {
    const remarks = prompt(`Enter remarks for ${status}:`);
    if (remarks === null) return;

    try {
      await axios.put(`http://localhost:5000/api/fees/verify/${id}`, { status, remarks }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPendingPayments();
    } catch (err) {
      alert('Verification failed');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.student?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Payment Verification</h1>
        <p className="text-secondary-500 font-medium mt-1">Verify student UTRs and approve fee payments.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <input 
          type="text"
          placeholder="Search by student name or UTR..."
          className="w-full pl-12 pr-6 py-4 bg-white border border-secondary-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-medium transition-all shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="p-20 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center text-secondary-300">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-secondary-900">All caught up!</h3>
          <p className="text-secondary-500 max-w-xs mx-auto">No pending payments require verification at this time.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment._id} className="p-6 transition-all hover:shadow-md border-l-4 border-l-amber-400">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black">
                    {payment.student?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900">{payment.student?.name}</h4>
                    <p className="text-xs text-secondary-500">Class {payment.student?.class} | Roll: {payment.student?.rollNumber}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-secondary-400">Transaction ID (UTR)</p>
                  <p className="font-mono font-bold text-primary-600">{payment.transactionId || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-secondary-400">Amount Paid</p>
                  <p className="text-xl font-black text-secondary-900">${payment.amount?.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => handleVerify(payment._id, 'Approved')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => handleVerify(payment._id, 'Rejected')}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  {payment.proofUrl && (
                    <button className="p-3 bg-secondary-100 text-secondary-600 rounded-xl hover:bg-secondary-200 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
