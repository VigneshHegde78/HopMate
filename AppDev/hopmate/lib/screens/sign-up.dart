import 'package:flutter/material.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPwdController = TextEditingController();
  String errorMessage = "";
  bool _obscure = true;
  final FocusNode _focusNode = FocusNode();
  bool _isActive = false;

  void onSignUpPress() {
    final username = usernameController.text.trim();
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final confirmPwd = confirmPwdController.text.trim();

    if (username.isEmpty || email.isEmpty || password.isEmpty || confirmPwd.isEmpty) {
      setState(() => errorMessage = "All fields are required");
      return;
    }

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

    if (password != confirmPwd) {
      setState(() => errorMessage = "Passwords do not match");
      return;
    }
  }

  void onGoogleSignIn() {
    // TODO: Add Google OAuth (use firebase_auth or clerk_flutter)
    debugPrint("Google Sign-In pressed");
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
                // Back button
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_ios_new, size: 22),
                ),

                const SizedBox(height: 10),

                // Title
                const Text(
                  "Let's get started !",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const Text(
                  "Enter your email and password to sign in.",
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 30),

                // Username field
                TextField(
                  controller: usernameController,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.person_outline),
                    hintText: "Username",
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

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

                const SizedBox(height: 16),

                // Confirm Password field
                TextField(
                  controller: confirmPwdController,
                  obscureText: _obscure,
                  focusNode: _focusNode,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_outline),
                    hintText: "Confirm Password",
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

                // Error
                Text(
                  errorMessage,
                  style: const TextStyle(color: Colors.red),
                ),

                const SizedBox(height: 8),

                // Sign Up button
                ElevatedButton(
                  onPressed: onSignUpPress,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text("Sign Up"),
                ),

                const SizedBox(height: 16),

                // Register now
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Already have an account? "),
                    GestureDetector(
                      onTap:
                          () => Navigator.pushNamed(
                        context,
                        "/sign-up",
                      ), // nav to signup
                      child: const Text(
                        "Login",
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
