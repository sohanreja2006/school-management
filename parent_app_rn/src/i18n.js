import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      "Overview": "Overview",
      "Attendance": "Attendance",
      "Fees": "Fees",
      "Marks": "Marks",
      "Today's Status": "Today's Status",
      "Attendance Logs": "Attendance Logs",
      "Subject Marks": "Subject Marks",
      "Paid": "Paid",
      "Balance": "Balance",
      "Quick Pay (UPI)": "Quick Pay (UPI)",
      "Payment History": "Payment History",
      "Sync Error": "Sync Error",
      "No recent updates": "No recent updates",
      "No history available": "No history available",
      "Marks not uploaded yet": "Marks not uploaded yet",
      "Logout": "Logout",
      "Class": "Class",
      "Roll": "Roll",
      "Verify & Save Payment": "Verify & Save Payment",
      "Pay via UPI App": "Pay via UPI App",
      "Parent Portal": "Parent Portal",
      "Academix": "Academix"
    }
  },
  bn: {
    translation: {
      "Overview": "সংক্ষিপ্ত বিবরণ",
      "Attendance": "উপস্থিতি",
      "Fees": "ফি",
      "Marks": "নম্বর",
      "Today's Status": "আজকের অবস্থা",
      "Attendance Logs": "উপস্থিতি লগ",
      "Subject Marks": "বিষয়ভিত্তিক নম্বর",
      "Paid": "পরিশোধিত",
      "Balance": "বাকি",
      "Quick Pay (UPI)": "দ্রুত পেমেন্ট (UPI)",
      "Payment History": "পেমেন্ট ইতিহাস",
      "Sync Error": "সিঙ্ক ত্রুটি",
      "No recent updates": "কোন নতুন আপডেট নেই",
      "No history available": "কোন ইতিহাস পাওয়া যায়নি",
      "Marks not uploaded yet": "এখনও নম্বর আপলোড হয়নি",
      "Logout": "লগআউট",
      "Class": "শ্রেণী",
      "Roll": "রোল",
      "Verify & Save Payment": "যাচাই ও পেমেন্ট সেভ করুন",
      "Pay via UPI App": "UPI অ্যাপের মাধ্যমে পেমেন্ট",
      "Parent Portal": "প্যারেন্ট পোর্টাল",
      "Academix": "একাডেমিক্স"
    }
  },
  hi: {
    translation: {
      "Overview": "अवलोकन",
      "Attendance": "उपस्थिति",
      "Fees": "फीस",
      "Marks": "अंक",
      "Today's Status": "आज की स्थिति",
      "Attendance Logs": "उपस्थिति लॉग",
      "Subject Marks": "विषय अंक",
      "Paid": "भुगतान किया",
      "Balance": "बकाया",
      "Quick Pay (UPI)": "त्वरित भुगतान (UPI)",
      "Payment History": "भुगतान इतिहास",
      "Sync Error": "सिंक त्रुटि",
      "No recent updates": "कोई हालिया अपडेट नहीं",
      "No history available": "कोई इतिहास उपलब्ध नहीं",
      "Marks not uploaded yet": "अंक अभी अपलोड नहीं हुए हैं",
      "Logout": "लॉगआउट",
      "Class": "कक्षा",
      "Roll": "रोल",
      "Verify & Save Payment": "सत्यापित करें और भुगतान सहेजें",
      "Pay via UPI App": "UPI ऐप के माध्यम से भुगतान",
      "Parent Portal": "अभिभावक पोर्टल",
      "Academix": "एकेडेमिक्स"
    }
  }
};

const LANGUAGE_KEY = 'settings.language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      return callback(savedLanguage);
    }
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
