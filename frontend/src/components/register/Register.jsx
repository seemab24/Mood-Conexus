import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Strict list of allowed email domains
  const VALID_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'protonmail.com',
    'icloud.com',
    'aol.com',
    'mail.com',
    'zoho.com',
    'gmx.com',
    'yandex.com',
    'qq.com',
    '163.com',
    'rediffmail.com',
    'live.com',
    'msn.com',
    'yopmail.com',
    'me.com',
    'rocketmail.com',
    'fastmail.com',
    'tutanota.com',
    'pm.me',
    'proton.me'
  ];

  const validateName = (name) => {
    if (!name) return "Name is required";
    
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return "Name should contain only alphabets and spaces";
    }
    
    if (name.trim().length < 2) {
      return "Name should be at least 2 characters long";
    }
    
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    
    // Basic format validation
    if (email.indexOf('@') === -1) return "Email must contain '@'";
    
    const parts = email.split('@');
    if (parts.length !== 2) return "Invalid email format";
    
    const domain = parts[1].toLowerCase();
    
    // Domain structure validation
    if (!domain.includes('.')) {
      return "Please include a complete domain (e.g., gmail.com)";
    }

    if (domain.split('.').pop().length < 2) {
      return "Domain extension must be at least 2 characters";
    }

    if (domain.includes('..')) return "Domain cannot contain consecutive dots";
    if (domain.endsWith('.')) return "Domain cannot end with a dot";

    // Check against allowed domains
    const isCustomDomain = domain.indexOf('.') > 0 && 
                         !VALID_EMAIL_DOMAINS.includes(domain);
    
    if (isCustomDomain) {
      return "Please use an email from a supported provider";
    }

    if (!VALID_EMAIL_DOMAINS.includes(domain)) {
      return `Please use a valid email provider (e.g., ${VALID_EMAIL_DOMAINS.slice(0, 3).join(', ')})`;
    }
    
    return "";
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) setNameError(validateName(value));
    else setNameError("");
    setErrorMessage("");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setEmail(value);
    
    if (value.includes('@')) {
      const validation = validateEmail(value);
      setEmailError(validation);
      setErrorMessage(validation || "");
    } else {
      setEmailError("");
      setErrorMessage("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Reset errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");
    setSuccessMessage("");

    // Validate all fields
    const nameValidation = validateName(name);
    if (nameValidation) {
      setNameError(nameValidation);
      setErrorMessage(nameValidation);
      setLoading(false);
      return;
    }

    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      setErrorMessage(emailValidation);
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors.join(". "));
      setErrorMessage(passwordErrors.join(". "));
      setLoading(false);
      return;
    }

    // Registration attempt
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User Registered:", userCredential.user);

      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      let errorMsg = "Registration failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Please enter a valid email address";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "Password should be at least 6 characters";
      }
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gradient-to-tr from-purple-950 to-black text-white">
      <div className="flex flex-col justify-center items-center p-8">
        <div className="flex flex-row items-center text-center space-x-4">
          <img src="logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Mood Conexus</h1>
          </div>
        </div>
        <p className="text-lg">Register to access your account and explore more features.</p>
      </div>

      <div className="flex justify-center items-center p-8">
        <form onSubmit={handleSubmit} className="bg-purple-950 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Mood Conexus</h2>

          {successMessage && (
            <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-lg font-medium text-gray-200 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Enter your name (letters only)"
              onChange={handleNameChange}
              onBlur={() => setNameError(validateName(name))}
              required
              className={`w-full px-4 py-2 border-2 rounded-md bg-purple-800 text-white ${
                nameError ? "border-red-500" : "border-purple-700"
              }`}
            />
            {nameError ? (
              <div className="text-red-400 text-sm mt-1">{nameError}</div>
            ) : (
              <div className="text-gray-400 text-sm mt-1">
                Only alphabets and spaces allowed
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="yourname@gmail.com"
              onChange={handleEmailChange}
              onBlur={() => setEmailError(validateEmail(email))}
              required
              className={`w-full px-4 py-2 border-2 rounded-md bg-purple-800 text-white ${
                emailError ? "border-red-500" : "border-purple-700"
              }`}
            />
            {emailError ? (
              <div className="text-red-400 text-sm mt-1">{emailError}</div>
            ) : (
              // to add a message for the user to enter a valid email
              <div className="text-gray-400 text-sm mt-1"> 
                
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              placeholder="At least 8 characters with special character"
              onChange={handlePasswordChange}
              onBlur={() => {
                const errors = validatePassword(password);
                setPasswordError(errors.join(". "));
              }}
              required
              className={`w-full px-4 py-2 border-2 rounded-md bg-purple-700 text-white ${
                passwordError ? "border-red-500" : "border-red-600"
              }`}
            />
            {passwordError ? (
              <div className="text-red-400 text-sm mt-1">{passwordError}</div>
            ) : (
              <div className="text-gray-400 text-sm mt-1">
                Must be 8+ characters with a special character
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-200 mb-2">Already have an account?</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;



// import  { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase";

// const Register = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const navigate = useNavigate();

//   const validateEmail = (email) => {
//     if (!email) return "Email is required";
    
//     // Basic check for @ symbol
//     if (email.indexOf('@') === -1) return "Email must contain '@'";
    
//     // Split into local and domain parts
//     const parts = email.split('@');
//     if (parts.length !== 2) return "Invalid email format";
    
//     const domain = parts[1];
    
//     // Check domain has at least one dot and proper extension
//     if (!domain.includes('.') || domain.split('.').pop().length < 2) {
//       return "Please include a complete domain (e.g., example.com)";
//     }
    
//     // Check for consecutive dots
//     if (domain.includes('..')) return "Domain cannot contain consecutive dots";
    
//     // Check doesn't end with dot
//     if (domain.endsWith('.')) return "Domain cannot end with a dot";
    
//     return ""; // No error
//   };

//   const validatePassword = (password) => {
//     const errors = [];
    
//     if (password.length < 8) {
//       errors.push("Password must be at least 8 characters long");
//     }
    
//     if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
//       errors.push("Password must contain at least one special character");
//     }
    
//     return errors;
//   };

//   const handleEmailChange = (e) => {
//     const value = e.target.value.trim();
//     setEmail(value);
    
//     // Only validate when user has started typing domain
//     if (value.includes('@')) {
//       setEmailError(validateEmail(value));
//     } else {
//       setEmailError("");
//     }
//     setErrorMessage(""); // Clear previous error messages
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setPassword(value);
//     setPasswordError("");
//     setErrorMessage(""); // Clear previous error messages
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate email
//     const emailValidation = validateEmail(email);
//     if (emailValidation) {
//       setEmailError(emailValidation);
//       setErrorMessage(emailValidation);
//       return;
//     }

//     // Validate password
//     const passwordErrors = validatePassword(password);
//     if (passwordErrors.length > 0) {
//       setPasswordError(passwordErrors.join(". "));
//       setErrorMessage(passwordErrors.join(". "));
//       return;
//     }

//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       console.log("User Registered:", userCredential.user);

//       setSuccessMessage("Registration successful! Redirecting...");
//       setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//     } catch (error) {
//       let errorMsg = error.message;
//       if (error.code === "auth/email-already-in-use") {
//         errorMsg = "This email is already registered. Please login instead.";
//       } else if (error.code === "auth/invalid-email") {
//         errorMsg = "Please enter a valid email address";
//       }
//       setErrorMessage(errorMsg);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gradient-to-tr from-purple-950 to-black text-white">
//       <div className="flex flex-col justify-center items-center p-8">
//         <div className="flex flex-row items-center text-center space-x-4">
//           <img src="logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full" />
//           <div>
//             <h1 className="text-4xl font-bold mb-2">Mood Conexus</h1>
//           </div>
//         </div>
//         <p className="text-lg">Register to access your account and explore more features.</p>
//       </div>

//       <div className="flex justify-center items-center p-8">
//         <form onSubmit={handleSubmit} className="bg-purple-950 rounded-lg shadow-lg p-8 max-w-md w-full">
//           <h2 className="text-3xl font-bold mb-6 text-center text-white">Mood Conexus</h2>

//           {successMessage && (
//             <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">
//               {successMessage}
//             </div>
//           )}
//           {errorMessage && (
//             <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
//               {errorMessage}
//             </div>
//           )}

//           <div className="mb-4">
//             <label htmlFor="name" className="block text-lg font-medium text-gray-200 mb-2">
//               Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               placeholder="Enter your name"
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="w-full px-4 py-2 border-2 border-purple-700 rounded-md bg-purple-800 text-white"
//             />
//           </div>

//           <div className="mb-4">
//             <label htmlFor="email" className="block text-lg font-medium text-gray-200 mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               placeholder="yourname@example.com"
//               onChange={handleEmailChange}
//               onBlur={() => setEmailError(validateEmail(email))}
//               required
//               className={`w-full px-4 py-2 border-2 rounded-md bg-purple-800 text-white ${
//                 emailError ? "border-red-500" : "border-purple-700"
//               }`}
//             />
//             {emailError && (
//               <div className="text-red-400 text-sm mt-1">{emailError}</div>
//             )}
//           </div>

//           <div className="mb-6">
//             <label htmlFor="password" className="block text-lg font-medium text-gray-200 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               placeholder="At least 8 characters with special character"
//               onChange={handlePasswordChange}
//               onBlur={() => {
//                 const errors = validatePassword(password);
//                 setPasswordError(errors.join(". "));
//               }}
//               required
//               className={`w-full px-4 py-2 border-2 rounded-md bg-purple-700 text-white ${
//                 passwordError ? "border-red-500" : "border-red-600"
//               }`}
//             />
//             {passwordError ? (
//               <div className="text-red-400 text-sm mt-1">{passwordError}</div>
//             ) : (
//               <div className="text-gray-400 text-sm mt-1">
//                 Must be 8+ characters with a special character
//               </div>
//             )}
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-purple-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors"
//           >
//             Register
//           </button>

//           <div className="text-center mt-4">
//             <p className="text-gray-200 mb-2">Already have an account?</p>
//             <button
//               type="button"
//               onClick={() => navigate("/login")}
//               className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
//             >
//               Login
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;






