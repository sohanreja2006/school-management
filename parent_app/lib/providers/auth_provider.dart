import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _token;
  Map<String, dynamic>? _userData;

  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get userData => _userData;

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      // For now, simulating a login success
      // In production, call ApiService.login(email, password)
      await Future.delayed(const Duration(seconds: 2));
      _isLoggedIn = true;
      _token = "mock_token";
      _userData = {
        "name": "John Doe",
        "email": email,
        "childName": "Alex Doe",
        "childId": "STU123"
      };
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void logout() {
    _isLoggedIn = false;
    _token = null;
    _userData = null;
    notifyListeners();
  }
}
