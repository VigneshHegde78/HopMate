import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:hopmate/screens/home.dart';
import 'package:hopmate/screens/profile.dart';
import 'package:hopmate/screens/rides.dart';
import 'package:hopmate/screens/saved.dart';

class TabNavigation extends StatelessWidget {
  TabNavigation({super.key});

  final NavigationController navController = Get.put(NavigationController());

  final List<Widget> _screens = [
    HomeScreen(),
    RidesScreen(),
    SavedScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Scaffold(
        extendBody: true,
        body: _screens[navController.currentIndex.value],
        bottomNavigationBar: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(30),
            child: BottomNavigationBar(
              currentIndex: navController.currentIndex.value,
              onTap: navController.changeTab,
              selectedItemColor: Colors.blue,
              unselectedItemColor: Colors.grey,
              showUnselectedLabels: true,
              type: BottomNavigationBarType.fixed,

              // keep sizes constant
              selectedFontSize: 12,
              unselectedFontSize: 12,
              selectedIconTheme: const IconThemeData(size: 24),
              unselectedIconTheme: const IconThemeData(size: 24),

              backgroundColor:
                  Colors.transparent, // 👈 important (use container color)
              elevation: 0, // remove default shadow
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.map_outlined),
                  label: "Home",
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.history_outlined),
                  label: "Rides",
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.bookmark_outline),
                  label: "Saved",
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline),
                  label: "Profile",
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationController extends GetxController {
  var currentIndex = 0.obs;
  void changeTab(int index) {
    currentIndex.value = index;
  }
}
