import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // for date formatting

class Ride {
  final String rideId;
  final String originAddress;
  final String destinationAddress;
  final String destinationLatitude;
  final String destinationLongitude;
  final int rideTime;
  final String farePrice;
  final String paymentStatus;
  final Driver driver;
  final DateTime rideDate; // ✅ New field

  Ride({
    required this.rideId,
    required this.originAddress,
    required this.destinationAddress,
    required this.destinationLatitude,
    required this.destinationLongitude,
    required this.rideTime,
    required this.farePrice,
    required this.paymentStatus,
    required this.driver,
    required this.rideDate, // ✅ Required now
  });
}

class Driver {
  final String firstName;
  final String lastName;
  final String profileImageUrl;
  final String carImageUrl;
  final int carSeats;
  final String rating;

  Driver({
    required this.firstName,
    required this.lastName,
    required this.profileImageUrl,
    required this.carImageUrl,
    required this.carSeats,
    required this.rating,
  });
}

class RidesScreen extends StatelessWidget {
  RidesScreen({super.key});

  final List<Ride> recentRides = [
    Ride(
      rideId: "1",
      originAddress: "Kathmandu, Nepal",
      destinationAddress: "Pokhara, Nepal",
      destinationLatitude: "28.209583",
      destinationLongitude: "83.985567",
      rideTime: 391,
      farePrice: "19500.00",
      paymentStatus: "pending",
      rideDate: DateTime(2024, 9, 12, 14, 30), // ✅ Example date
      driver: Driver(
        firstName: "David",
        lastName: "Brown",
        profileImageUrl:
            "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
        carImageUrl:
            "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
        carSeats: 5,
        rating: "4.60",
      ),
    ),
    Ride(
      rideId: "2",
      originAddress: "Jalkot, MH",
      destinationAddress: "Pune, Maharashtra, India",
      destinationLatitude: "18.520430",
      destinationLongitude: "73.856744",
      rideTime: 491,
      farePrice: "24500.00",
      paymentStatus: "paid",
      rideDate: DateTime(2024, 9, 10, 9, 15), // ✅ Example date
      driver: Driver(
        firstName: "James",
        lastName: "Wilson",
        profileImageUrl:
            "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
        carImageUrl:
            "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
        carSeats: 4,
        rating: "4.80",
      ),
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
                "Ride History",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF454545),
                ),
              ),
              const SizedBox(height: 5),
              Text(
                "You can see your recent rides here.",
                style: TextStyle(fontSize: 15, color: Colors.grey[600]),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: ListView.builder(
                  itemCount: recentRides.length,
                  itemBuilder: (context, index) {
                    final ride = recentRides[index];
                    return RideCard(ride: ride);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ✅ Stateful because rating changes dynamically
class RideCard extends StatefulWidget {
  final Ride ride;
  const RideCard({super.key, required this.ride});

  @override
  State<RideCard> createState() => _RideCardState();
}

class _RideCardState extends State<RideCard> {
  int rating = 0; // ⭐ Initially 0 stars

  @override
  Widget build(BuildContext context) {
    final ride = widget.ride;

    final mapUrl =
        "https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destinationLongitude},${ride.destinationLatitude}&zoom=14&apiKey=96e2d1d636164eea813ef2a0cb0c7103";

    final formattedDate = DateFormat(
      "dd MMM yyyy, hh:mm a",
    ).format(ride.rideDate);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row with map + addresses
            Row(
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.my_location_outlined,
                            color: Colors.blue,
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              ride.originAddress,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Icon(
                            Icons.share_location_outlined,
                            color: Colors.blue,
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              ride.destinationAddress,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            Text(
              "Date & Time: $formattedDate",
              style: TextStyle(color: Colors.grey[700], fontSize: 13),
            ),
            Text(
              "Payment Status: ${ride.paymentStatus}",
              style: TextStyle(color: Colors.grey[700], fontSize: 13),
            ),

            const SizedBox(height: 6),

            // ⭐ Dynamic rating stars
            Row(
              children: List.generate(5, (index) {
                return IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: Icon(
                    Icons.star,
                    color: index < rating ? Colors.amber : Colors.grey,
                    size: 22,
                  ),
                  onPressed: () {
                    setState(() {
                      if (index + 1 == rating) {
                        rating = 0; // ⭐ Tap same star to reset
                        return;
                      } else {
                        rating = index + 1;
                      } // ⭐ set new rating
                    });
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
