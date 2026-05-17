import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://10.0.2.2:5000/api"; // For Android Emulator to access localhost

  static Future<Map<String, dynamic>> getChildData(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/parent/child-data'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load child data');
    }
  }

  // Add more methods for fees, attendance, etc.
}
