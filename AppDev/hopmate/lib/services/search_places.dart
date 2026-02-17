import 'dart:convert';
import 'package:http/http.dart' as http;

class OlaSearchService {
  final String apiKey = "Vxsho8nMMIUgXTYkhUkhmAYI9ZveljzPUy52rfi4";

  Future<List<Map<String, dynamic>>> fetchSuggestions(String query) async {
    final requestId = DateTime.now().millisecondsSinceEpoch.toString();

    final uri = Uri.parse(
      "https://api.olamaps.io/places/v1/autocomplete?input=$query&api_key=$apiKey",
    );

    final response = await http.get(uri, headers: {'X-Request-Id': requestId});

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final predictions = data['predictions'] as List;

      return predictions
          .map(
            (p) => {
              "name": p["description"],
              "lat": p["geometry"]["location"]["lat"],
              "lng": p["geometry"]["location"]["lng"],
            },
          )
          .toList();
    } else {
      throw Exception("Failed to fetch suggestions from Ola Places");
    }
  }
}
