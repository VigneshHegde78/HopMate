import 'package:flutter/material.dart';

class SavedRoute {
  final String savedId;
  final String nickname;
  final String destinationAddress;
  final String destinationLatitude;
  final String destinationLongitude;
  final int rideTime;

  SavedRoute({
    required this.savedId,
    required this.nickname,
    required this.destinationAddress,
    required this.destinationLatitude,
    required this.destinationLongitude,
    required this.rideTime,
  });
}

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  bool saved = true;

  final List<SavedRoute> savedRoutes = [
    SavedRoute(
      savedId: "1",
      nickname: "Home",
      destinationAddress: "Pokhara, Nepal",
      destinationLatitude: "28.209583",
      destinationLongitude: "83.985567",
      rideTime: 391,
    ),
    SavedRoute(
      savedId: "2",
      nickname: "College",
      destinationAddress: "Pune, Maharashtra, India",
      destinationLatitude: "18.520430",
      destinationLongitude: "73.856744",
      rideTime: 491,
    ),
    SavedRoute(
      savedId: "3",
      nickname: "Work",
      destinationAddress: "Rijeka, Croatia",
      destinationLatitude: "45.327063",
      destinationLongitude: "14.442176",
      rideTime: 124,
    ),
    SavedRoute(
      savedId: "4",
      nickname: "Vacation Trip",
      destinationAddress: "Osaka, Japan",
      destinationLatitude: "34.693725",
      destinationLongitude: "135.502254",
      rideTime: 159,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Your Saved Rides",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF454545),
                ),
              ),
              const SizedBox(height: 5),
              Text(
                "You can see all your saved destinations here.",
                style: TextStyle(fontSize: 15, color: Colors.grey[600]),
              ),
              const SizedBox(height: 10),
              Expanded(
                child:
                    saved
                        ? ListView.builder(
                          itemCount: savedRoutes.length,
                          itemBuilder: (context, index) {
                            final item = savedRoutes[index];
                            final mapUrl =
                                "https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${item.destinationLongitude},${item.destinationLatitude}&zoom=14&apiKey=96e2d1d636164eea813ef2a0cb0c7103";

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.shade300,
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      mapUrl,
                                      width: 80,
                                      height: 90,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.destinationAddress,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                            color: Color(0xFF454545),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          "${item.rideTime} mins",
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          item.nickname,
                                          style: TextStyle(
                                            color: Colors.grey[500],
                                            fontSize: 13,
                                            fontWeight: FontWeight.w300,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      debugPrint("Delete pressed");
                                    },
                                    child: const Icon(
                                      Icons.delete,
                                      size: 20,
                                      color: Colors.red,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        )
                        : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 60),
                            Image.network(
                              "https://cdn-icons-png.flaticon.com/512/4076/4076504.png", // replace with emptyList image
                              width: 140,
                              height: 140,
                              fit: BoxFit.contain,
                            ),
                            const SizedBox(height: 10),
                            const Text(
                              "You don't have any saved rides yet — start adding now!",
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: Color(0xFF454545),
                              ),
                            ),
                          ],
                        ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
