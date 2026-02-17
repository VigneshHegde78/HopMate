import 'package:flutter/material.dart';
import 'package:hopmate/components/tab_bar.dart';
import 'package:http/http.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  String errorMessage = "";
  bool _obscure = true;
  final FocusNode _focusNode = FocusNode();
  bool _isActive = false;

  void onSignInPress() {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() => errorMessage = "Email and password required");
      return;
    }

    // TODO: Replace with Clerk sign-in logic
    if (email == "demo@test.com" && password == "123456") {
      Navigator.pushReplacementNamed(context, "/home");
    } else {
      setState(() => errorMessage = "Invalid credentials");
    }
  }

  void onGoogleSignIn() {
    // TODO: Add Google OAuth (use firebase_auth or clerk_flutter)
    debugPrint("Google Sign-In pressed");
    Navigator.pushReplacementNamed(context, "/home");
  }

  @override
  void initState() {
    super.initState();

    // Listen for focus changes
    _focusNode.addListener(() {
      setState(() {
        _isActive = _focusNode.hasFocus; // true if active
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose(); // cleanup
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 60),

                // Title
                const Text(
                  "Welcome Back!",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const Text(
                  "Enter your email and password to sign in.",
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 30),

                // Email field
                TextField(
                  controller: emailController,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.mail_outline),
                    hintText: "Email",
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Password field
                TextField(
                  controller: passwordController,
                  obscureText: _obscure,
                  focusNode: _focusNode,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_outline),
                    hintText: "Password",
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixIcon:
                        _isActive
                            ? IconButton(
                              icon: Icon(
                                _obscure
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                              ),
                              color: Colors.grey,
                              onPressed: () {
                                setState(() {
                                  _obscure = !_obscure;
                                });
                              },
                            )
                            : null,
                  ),
                ),

                const SizedBox(height: 8),

                // Error + Forgot Password
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      errorMessage,
                      style: const TextStyle(color: Colors.red),
                    ),
                    TextButton(
                      onPressed: () {
                        // TODO: Forgot password flow
                      },
                      child: const Text("Forgot Password?"),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // Sign In button
                ElevatedButton(
                  onPressed: () {
                    onSignInPress();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => TabNavigation()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text("Sign In"),
                ),

                const SizedBox(height: 16),

                // Register now
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? "),
                    GestureDetector(
                      onTap:
                          () => Navigator.pushNamed(
                            context,
                            "/register",
                          ), // nav to signup
                      child: const Text(
                        "Register now",
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Divider
                Row(
                  children: const [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 10),
                      child: Text("OR"),
                    ),
                    Expanded(child: Divider()),
                  ],
                ),

                const SizedBox(height: 20),

                ElevatedButton(
                  onPressed: onGoogleSignIn,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      side: const BorderSide(color: Colors.grey),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        "assets/icons/google.png", // add google logo in assets
                        width: 24,
                        height: 24,
                      ),
                      const SizedBox(width: 10),
                      const Text("Sign in with Google"),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
