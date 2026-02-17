import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ProfileScreen extends StatelessWidget {
  ProfileScreen({super.key});

  // Simulated user object like Clerk
  final Map<String, dynamic> user = {
    "fullName": "John Doe",
    "username": "johndoe123",
    "imageUrl": "https://randomuser.me/api/portraits/men/1.jpg",
    "primaryPhoneNumber": "7498111406",
    "primaryEmailAddress": "johndoe@example.com",
    "createdAt": "2024-08-12T05:19:20.620Z",
  };

  // Fallback/static data
  final Map<String, String> users = {
    "about_me": "Explorer",
    "gender": "Male",
    "date_of_birth": "2005-10-20T05:19:20.620Z",
  };

  // Utility function to format date
  String formatDateString(String? dateString) {
    if (dateString == null) return "Not Found";
    final date = DateTime.parse(dateString);
    return DateFormat('dd MMM yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final double maxWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            // Fixed Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Profile",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Profile Image + Name
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.black, width: 2),
                        ),
                        child: CircleAvatar(
                          radius: 40,
                          backgroundImage: NetworkImage(user["imageUrl"] ?? ""),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user["fullName"] ?? "Not Found",
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            user["username"] ?? "Not Found",
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Edit Profile Button
                  SizedBox(
                    width: maxWidth,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        print("Edit Profile Pressed");
                      },
                      icon: const Icon(Icons.create),
                      label: const Text("Edit Profile"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 14,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Section
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                child: Column(
                  children: [
                    buildCard(
                      children: [
                        buildInfo("About me", users["about_me"]),
                        buildInfo("Gender", users["gender"]),
                        buildInfo(
                          "DOB",
                          formatDateString(users["date_of_birth"]),
                        ),
                        buildInfo(
                          "Member since",
                          formatDateString(user["createdAt"]),
                        ),
                      ],
                    ),
                    buildCard(
                      children: [
                        buildInfo("Phone No.", user["primaryPhoneNumber"]),
                        buildInfo("Email", user["primaryEmailAddress"]),
                      ],
                    ),

                    // Logout Button
                    SizedBox(
                      width: maxWidth,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          print("Logout Pressed");
                        },
                        icon: const Icon(Icons.logout_outlined),
                        label: const Text("Logout"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 14,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 8),
                    // Delete Account Button
                    SizedBox(
                      width: maxWidth,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          print("Delete Account");
                        },
                        icon: const Icon(Icons.create),
                        label: const Text("Delete Account"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 14,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Reusable Card Widget
  Widget buildCard({required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(top: 16, left: 16, right: 16, bottom: 8),
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  // Reusable Info Row
  Widget buildInfo(String title, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 4),
          Text(value ?? "Not Found", style: TextStyle(color: Colors.grey[600])),
        ],
      ),
    );
  }
}
