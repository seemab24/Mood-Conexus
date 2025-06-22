import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Redux/authSlice";
//import { Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase authentication

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clears previous errors
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);

      const user = userCredential.user;
      const token = await user.getIdToken(); // Get Firebase auth token

      localStorage.setItem("token", token);
      dispatch(loginSuccess({ user, email, token }));

      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    
  const isValidEmail = (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    // Basic format check
    const emailRegex = /^[a-zA-Z][\w.-]*@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) return false;
    
    // Domain and TLD validation
    const domain = trimmedEmail.split("@")[1];
    
    const allowedDomains = [
      "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "yopmail.com",
      "gmx.com", "mailinator.com", "fastmail.com", "tutanota.com", "hushmail.com",
      "protonmail.com", "zoho.com", "aol.com", "live.com", "mail.com"
    ];
  
    return allowedDomains.includes(domain);
  };

  if (!isValidEmail(resetEmail)) {
    setError("Email must start with a letter and use a valid domain (e.g., example@gmail.com).");
    setIsLoading(false);
    return;
  }
  if (!resetEmail) {
    setError("Please enter your email address");
    setIsLoading(false);
    return;
  }

    
    try {
      
      await sendPasswordResetEmail(auth, resetEmail, {
        url: window.location.origin + '/login', // Redirect URL after resetting password
      });
      
      console.log("Password reset request processed for:", resetEmail);
      setResetSent(true);
      setError("");
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error.code === "auth/invalid-email") {
        setError("Invalid email format. Please enter a valid email address.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForgotMode = () => {
    setForgotMode(!forgotMode);
    setResetEmail(email); // Pre-fill with login email if available
    setError("");
    setResetSent(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gradient-to-tr from-purple-950 to-black text-white"> 
      {/* Left Grid */}
      <div className="flex flex-col justify-center items-center p-8">
        <div className="flex flex-row items-center text-center space-x-4">
          <img src="logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Mood Conexus</h1>
          </div>
        </div>
        <p className="text-lg mt-4">
          Log in to access your account and explore more features.
        </p>
      </div>

      {/* Right Grid */}
      <div className="flex justify-center items-center p-8">
        {!forgotMode ? (
          <form onSubmit={handleSubmit} className="bg-purple-950 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Mood Conexus</h2>
            <p className="font-bold mb-6 text-center text-white">Let's sign you in quickly</p>

            {error && <p className="text-red-400 text-center mb-4">{error}</p>}

            <div className="mb-4">
              <label htmlFor="email" className="block text-lg font-medium text-gray-200 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-purple-700 rounded-md bg-purple-800 text-white"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-lg font-medium text-gray-200 mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-red-500 rounded-md bg-purple-800 text-white"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-purple-700 text-white py-2 rounded-md text-lg font-semibold hover:bg-purple-600 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              Login
            </button>

            <div className="text-center mt-4 mb-4">
              <button 
                type="button" 
                onClick={toggleForgotMode}
                className="text-purple-400 hover:text-purple-500"
              >
                Forgot Password?
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-200 mb-2">Don't have an account?</p>
              <button type="button" onClick={() => navigate("/register")} className="text-purple-400 hover:text-purple-500">
                Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="bg-purple-950 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Reset Password</h2>
            
            {resetSent ? (
              <div className="text-center mb-6">
                <p className="text-green-400 mb-4">Password reset email sent!</p>
                <p className="text-gray-200 mb-4">
                  If an account exists with this email, you will receive password reset instructions shortly.
                </p>
                <p className="text-gray-300 text-sm">
                  If you don't see the email in your inbox, please check your spam folder.
                </p>
              </div>
            ) : (
              <>
                <p className="font-medium mb-6 text-center text-white">Enter your email address and we'll send you a link to reset your password</p>
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                <div className="mb-6">
                  <label htmlFor="resetEmail" className="block text-lg font-medium text-gray-200 mb-2">Email</label>
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    title="Please enter a valid email address (e.g., example@domain.com)"
                    className="w-full px-4 py-2 border-2 border-purple-700 rounded-md bg-purple-800 text-white"
                    placeholder="Enter your registered email"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-purple-700 text-white py-2 rounded-md text-lg font-semibold hover:bg-purple-600 flex justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : null}
                  Send Reset Link
                </button>
              </>
            )}
            
            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={toggleForgotMode}
                className="text-purple-400 hover:text-purple-500"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;