import 'package:flutter/material.dart';
import 'package:hopmate/components/tab_bar.dart';
import 'package:hopmate/screens/sign-up.dart';
import 'screens/onboarding.dart';
import 'screens/sign-in.dart';

void main() {
  runApp(const HopMateApp());
}

class HopMateApp extends StatelessWidget {
  const HopMateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HopMate',
      theme: ThemeData(splashColor: Colors.white, highlightColor: Colors.white),
      initialRoute: "/onboarding",
      routes: {
        "/onboarding": (context) => OnboardingPage(),
        "/login": (context) => SignInScreen(),
        "/register": (context) => SignUpScreen(),
        "/home": (context) => TabNavigation(),
      },
    );
  }
}
