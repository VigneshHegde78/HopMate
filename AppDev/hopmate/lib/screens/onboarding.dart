import 'package:flutter/material.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  _OnboardingPageState createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _controller = PageController();
  int _currentIndex = 0;

  final List<Map<String, String>> pages = [
    {
      "title": "Find Your Perfect Ride",
      "description":
      "See nearby available cabs, choose your route, and get ready to roll.",
      "image": "assets/images/onboarding1.png"
    },
    {
      "title": "Split the Bill, Save the Thrill",
      "description":
      "Hop in with others and share the ride cost — eco-friendly and wallet-happy.",
      "image": "assets/images/onboarding2.png"
    },
    {
      "title": "Smart Matchmaking for Shared Rides",
      "description":
      "Get paired with riders going your way. Safe, smart, and super simple.",
      "image": "assets/images/onboarding3.png"
    },
    {
      "title": "Hop In, Sit Back, Enjoy",
      "description":
      "Your ride’s here. All that’s left? Sit back, relax, and enjoy the journey.",
      "image": "assets/images/onboarding4.png"
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            // Pages
            PageView.builder(
              controller: _controller,
              itemCount: pages.length,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
              },
              itemBuilder: (context, index) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(pages[index]["image"]!, height: 250),
                    const SizedBox(height: 30),
                    Text(
                      pages[index]["title"]!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 30),
                      child: Text(
                        pages[index]["description"]!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.black54,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),

            // Skip button
            Positioned(
              top: 16,
              right: 20,
              child: GestureDetector(
                onTap: () {
                  Navigator.pushReplacementNamed(context, "/login");
                },
                child: RichText(
                  text: TextSpan(
                    style: TextStyle(fontSize: 16, color: Colors.black),
                    children: [
                      TextSpan(
                        text: "SKIP",
                        style: TextStyle(fontSize: 12, decoration: TextDecoration.underline, decorationThickness: 2),
                      ),
                    ],
                  ),
                )

              ),
            ),

            // Indicators + Button
            Positioned(
              bottom: 30,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      pages.length,
                          (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: _currentIndex == index ? 16 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _currentIndex == index
                              ? Colors.blue
                              : Colors.grey,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      if (_currentIndex == pages.length - 1) {
                        Navigator.pushReplacementNamed(context, "/login");
                      } else {
                        _controller.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      fixedSize: Size(
                        MediaQuery.of(context).size.width * 0.8,
                        50,
                      ),
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(
                      _currentIndex == pages.length - 1
                          ? "Get Started"
                          : "Next",
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
