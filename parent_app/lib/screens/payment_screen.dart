import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentScreen extends StatefulWidget {
  final double amountDue;
  const PaymentScreen({super.key, required this.amountDue});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  bool _isProcessing = false;
  String? _invoiceUrl;

  Future<void> _handlePayment() async {
    setState(() => _isProcessing = true);
    
    // 1. Call your Backend to create a PaymentIntent
    // final response = await http.post('/api/parent/create-payment-intent', body: {'amount': widget.amountDue});
    // final clientSecret = jsonDecode(response.body)['clientSecret'];

    // 2. Initialize Stripe Payment Sheet (Requires flutter_stripe package)
    // await Stripe.instance.initPaymentSheet(paymentSheetParameters: SetupPaymentSheetParameters(
    //   paymentIntentClientSecret: clientSecret,
    //   merchantDisplayName: 'Academix School',
    // ));

    // 3. Display Payment Sheet
    // await Stripe.instance.presentPaymentSheet();

    // 4. If successful, notify backend to record the payment
    // await http.post('/api/parent/pay-fees', body: {'amount': widget.amountDue, 'paymentMethod': 'Stripe'});
    
    await Future.delayed(const Duration(seconds: 2)); // Simulating the flow
    
    setState(() {
      _isProcessing = false;
      _invoiceUrl = "http://localhost:5000/api/parent/invoice/mock_id"; 
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Payment Successful!")),
      );
    }
  }

  Future<void> _downloadInvoice() async {
    if (_invoiceUrl != null) {
      final url = Uri.parse(_invoiceUrl!);
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Fee Payment", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Padding(
        padding: const EdgeInsets.all(25.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            FadeInDown(
              child: Container(
                padding: const EdgeInsets.all(30),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Column(
                  children: [
                    const Text("Amount to Pay", style: TextStyle(color: Color(0xFF64748B))),
                    const SizedBox(height: 10),
                    Text("\$${widget.amountDue.toStringAsFixed(2)}", 
                      style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
            if (_invoiceUrl == null) ...[
              const Text("Scan to Pay", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: Column(
                  children: [
                    Image.network(
                      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=school@upi&pn=AcademixSchool", // Mock QR
                      height: 200,
                    ),
                    const SizedBox(height: 15),
                    const Text("UPI ID: school@upi", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4F46E5))),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              const Text("Submit Payment Proof", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 10),
              TextField(
                decoration: InputDecoration(
                  hintText: "Enter Transaction ID / UTR",
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _handlePayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  child: _isProcessing 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("I Have Paid", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ] else ...[
              FadeInUp(
                child: Column(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 80),
                    const SizedBox(height: 20),
                    const Text("Payment Successful!", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    const Text("Your payment has been received and processed.", textAlign: TextAlign.center),
                    const SizedBox(height: 40),
                    SizedBox(
                      width: double.infinity,
                      height: 60,
                      child: OutlinedButton.icon(
                        onPressed: _downloadInvoice,
                        icon: const Icon(Icons.download),
                        label: const Text("Download Invoice"),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF4F46E5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text("Back to Dashboard"),
                    )
                  ],
                ),
              )
            ],
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String title, IconData icon, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFF4F46E5).withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFF1F5F9), width: 2),
      ),
      child: Row(
        children: [
          Icon(icon, color: isSelected ? const Color(0xFF4F46E5) : Colors.grey),
          const SizedBox(width: 15),
          Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? const Color(0xFF4F46E5) : Colors.black87)),
          const Spacer(),
          if (isSelected) const Icon(Icons.check_circle, color: Color(0xFF4F46E5), size: 20),
        ],
      ),
    );
  }
}
