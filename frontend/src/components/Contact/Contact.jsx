import { useState } from "react";
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";


const Contact = ({ theme, changeTheme }) => {
  // Theme styles
  const themeStyles = {
    purple: "text-purple-400 bg-purple-900",
    blue: "text-blue-400 bg-blue-900",
    grey: "text-gray-300 bg-gray-700",
    red: "text-red-400 bg-red-900",
    pink: "text-pink-400 bg-pink-900",
    green: "text-green-300 bg-green-900",
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'protonmail.com', 'yopmail.com', 'icloud.com', 'aol.com',
      'mail.com', 'zoho.com', 'gmx.com'
    ];
    if (!re.test(email)) return false;
  
  const domain = email.split('@')[1].toLowerCase();
  return commonDomains.some(common => domain === common);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // Using FormSubmit's AJAX endpoint
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("message", formData.message);
      formDataToSend.append("_captcha", "false");
      formDataToSend.append("_subject", "New Contact Form Submission");

      const response = await fetch("https://formsubmit.co/ajax/ch.mariyam06@gmail.com", {
        method: "POST",
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        // Hide success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles[theme]}`}>
      <Navigation />
      
      {/* Theme toggle button */}
      <button
        onClick={changeTheme}
        className="fixed bottom-8 right-8 bg-white text-purple-950 font-bold rounded-md hover:bg-black hover:text-white p-2 z-50"
        aria-label="Change Theme"
      >
        Click me
      </button>

      {/* Success notification */}
      {isSubmitted && (
        <div className="fixed top-4 right-4 p-4 bg-green-500 text-white rounded-md shadow-lg z-50 animate-fade-in">
          Thank you! Your message has been sent successfully.
        </div>
      )}

      <div className="flex-grow container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">Contact Us</h1>
          <p className="text-lg md:text-xl mt-4">
            Have questions? We will respond to your email address.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Name field */}
            <div>
              <label className="block text-lg font-medium mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md bg-gray-100 text-black ${
                  errors.name ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
            </div>
            
            {/* Email field */}
            <div>
              <label className="block text-lg font-medium mb-2">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md bg-gray-100 text-black ${
                  errors.email ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
            </div>
            
            {/* Message field */}
            <div>
              <label className="block text-lg font-medium mb-2">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md bg-gray-100 text-black ${
                  errors.message ? "border-2 border-red-500" : ""
                }`}
                rows="4"
                placeholder="Type your message here..."
              ></textarea>
              {errors.message && <p className="text-red-500 mt-1">{errors.message}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-white text-purple-950 font-bold rounded-md hover:bg-purple-400 hover:text-white ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;