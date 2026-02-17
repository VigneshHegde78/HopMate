import 'package:flutter/material.dart';
import 'package:hopmate/services/search_places.dart';

class CustomSearchBar extends StatefulWidget {
  final Function(double lat, double lng) onPlaceSelected;

  const CustomSearchBar({super.key, required this.onPlaceSelected});

  @override
  State<CustomSearchBar> createState() => _CustomSearchBarState();
}

class _CustomSearchBarState extends State<CustomSearchBar> {
  final TextEditingController _controller = TextEditingController();
  final OlaSearchService _searchService = OlaSearchService();
  List<Map<String, dynamic>> _suggestions = [];
  bool _isLoading = false;

  void _onSearchChanged(String value) async {
    if (value.isEmpty) {
      setState(() => _suggestions = []);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final results = await _searchService.fetchSuggestions(value);
      print("🔎 Got results: $results"); // <-- check in console
      setState(() => _suggestions = results);
    } catch (e) {
      debugPrint("Search error: $e");
    }

    setState(() => _isLoading = false);
  }

  /// 👉 This is where your `_onSuggestionSelected` goes
  void _onSuggestionSelected(Map<String, dynamic> suggestion) {
    final lat = suggestion["lat"];
    final lng = suggestion["lng"];

    // Move camera via parent callback
    widget.onPlaceSelected(lat, lng);

    // Update text field with selected place
    _controller.text = suggestion["name"];

    // Clear suggestions
    setState(() {
      _suggestions = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        TextField(
          controller: _controller,
          onChanged: _onSearchChanged,
          decoration: InputDecoration(
            hintText: "Search places",
            prefixIcon: const Icon(Icons.search),
            suffixIcon:
                _isLoading
                    ? Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                    : null,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),

        // Suggestions dropdown
        if (_suggestions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 56),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              boxShadow: const [
                BoxShadow(color: Colors.black26, blurRadius: 5),
              ],
            ),
            constraints: const BoxConstraints(
              maxHeight: 200, // limit height so it doesn’t cover everything
            ),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: _suggestions.length,
              itemBuilder: (context, index) {
                final suggestion = _suggestions[index];
                return ListTile(
                  leading: const Icon(Icons.place, color: Colors.blue),
                  title: Text(suggestion["name"]),
                  onTap: () => _onSuggestionSelected(suggestion),
                );
              },
            ),
          ),
      ],
    );
  }
}
