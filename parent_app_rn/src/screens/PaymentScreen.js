import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator, Linking } from 'react-native';
import { MotiView } from 'moti';
import { ChevronLeft, CheckCircle, Download, ExternalLink } from 'lucide-react-native';

export default function PaymentScreen({ route, navigation }) {
  const { amountDue } = route.params || { amountDue: 1200.0 };
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulating payment flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setInvoiceUrl("http://localhost:5000/api/parent/invoice/mock_id");
  };

  const downloadInvoice = async () => {
    if (invoiceUrl) {
      const supported = await Linking.canOpenURL(invoiceUrl);
      if (supported) {
        await Linking.openURL(invoiceUrl);
      } else {
        alert("Cannot open URL: " + invoiceUrl);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Fee Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>${amountDue.toFixed(2)}</Text>
        </MotiView>

        {!invoiceUrl ? (
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Scan to Pay</Text>
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=school@upi&pn=AcademixSchool" }} 
                style={styles.qrImage}
              />
              <Text style={styles.upiId}>UPI ID: school@upi</Text>
            </View>

            <Text style={styles.subSectionTitle}>Submit Payment Proof</Text>
            <TextInput
              placeholder="Enter Transaction ID / UTR"
              placeholderTextColor="#94A3B8"
              style={styles.transactionInput}
            />

            <View style={{ flex: 1, minHeight: 100 }} />

            <TouchableOpacity 
              onPress={handlePayment} 
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <View style={[styles.payButton, isProcessing && styles.buttonDisabled]}>
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payButtonText}>I Have Paid</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.successSection}
          >
            <CheckCircle size={80} color="#10B981" />
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>Your payment has been received and processed.</Text>

            <TouchableOpacity style={styles.downloadButton} onPress={downloadInvoice}>
              <Download size={20} color="#7c3aed" />
              <Text style={styles.downloadButtonText}>Download Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.pop()}>
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit_700Bold',
  },
  scrollContent: {
    padding: 25,
    flexGrow: 1,
  },
  amountCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  amountLabel: {
    color: '#64748B',
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
  },
  amountValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 10,
    fontFamily: 'Outfit_700Bold',
  },
  paymentSection: {
    marginTop: 40,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    fontFamily: 'Outfit_700Bold',
  },
  qrContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  upiId: {
    marginTop: 15,
    fontWeight: 'bold',
    color: '#7c3aed',
    fontFamily: 'Outfit_700Bold',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#1E293B',
    fontFamily: 'Outfit_700Bold',
  },
  transactionInput: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Outfit_400Regular',
  },
  payButton: {
    backgroundColor: '#7c3aed',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit_700Bold',
  },
  successSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#1E293B',
    fontFamily: 'Outfit_700Bold',
  },
  successSubtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 10,
    paddingHorizontal: 20,
    fontFamily: 'Outfit_400Regular',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 20,
    marginTop: 40,
  },
  downloadButtonText: {
    color: '#7c3aed',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit_700Bold',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#64748B',
    fontFamily: 'Outfit_400Regular',
  },
});
