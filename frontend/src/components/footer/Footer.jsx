//import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = ({ theme }) => {
  // Set different color schemes based on the theme
  const footerStyles = {
    purple: "bg-purple-950 text-gray-300",
    blue: "bg-blue-950 text-gray-300",
    grey: "bg-gray-950 text-gray-300",
    pink: "bg-pink-950 text-gray-300",
  };

  return (
    <footer className={`${footerStyles[theme]} py-6`}>
      <div className="container mx-auto px-6">
        {/* Top Section: Links and Social Media */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Links */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <h2 className="text-lg font-bold text-purple-200">Mood Conexus</h2>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/1PxDs7X1Pa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-black-200 hover:text-blue-200 transition duration-300"
              >
                <FaFacebookF size={24} className="opacity-100"/>
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-blue-200 hover:text-blue-600 transition duration-300"
              >
                <FaTwitter size={24} className="opacity-100"/>
              </a>
              <a
                href="https://www.instagram.com/seemab_h24?igsh=Nnhzc2hucnIwM3l1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-pink-200 hover:text-pink-500 transition duration-300"
              >
                <FaInstagram size={24} className="opacity-100"/>
              </a>
              <a
                href="https://www.linkedin.com/in/mariyam-chauhdry-592231270"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-blue-200 hover:text-blue-500 transition duration-300"
              >
                <FaLinkedinIn size={24} className="opacity-100"/>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link
              to="/home"
              className="text-gray-300 hover:text-purple-400 transition duration-300"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-purple-400 transition duration-300"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-gray-300 hover:text-purple-400 transition duration-300"
            >
              Contact
            </Link>
            <Link
              to="/favorites"
              className="text-gray-300 hover:text-purple-400 transition duration-300"
            >
              My Favorites
            </Link>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="mt-6 border-t border-purple-700 pt-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Mood Conexus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// import { Link } from "react-router-dom";

// const Footer = ({ theme = "purple" }) => {
//   // Set different color schemes based on the theme
//   const footerStyles = {
//     purple: "bg-purple-950 text-gray-300",
//     blue: "bg-blue-950 text-gray-300",
//     grey: "bg-gray-950 text-gray-300",
//     pink: "bg-pink-950 text-gray-300",
//   };

//   return (
//     <footer className={`${footerStyles[theme]} py-6`}>
//       <div className="container mx-auto px-6">
//         {/* Top Section: Links and Social Media */}
//         <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
//           {/* Logo and Links */}
//           <div className="flex flex-col items-center md:items-start space-y-2">
//             <h2 className="text-lg font-bold text-purple-200">Mood Conexus</h2>
//             <div className="flex space-x-4">
//               <a
//                 href="https://www.facebook.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="Facebook"
//                 className="hover:opacity-80 transition duration-300"
//               >
//                 <img 
//                   src="/facebook-icon.jpg" 
//                   alt="Facebook" 
//                   className="h-6 w-6"
//                 />
//               </a>
//               <a
//                 href="https://www.twitter.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="Twitter"
//                 className="hover:opacity-80 transition duration-300"
//               >
//                 <img 
//                   src="/twitter-icon.png" 
//                   alt="Twitter" 
//                   className="h-6 w-6"
//                 />
//               </a>
//               <a
//                 href="https://www.instagram.com/seemab_h24?igsh=Nnhzc2hucnIwM3l1"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="Instagram"
//                 className="hover:opacity-80 transition duration-300"
//               >
//                 <img 
//                   src="/instagram-icon.png" 
//                   alt="Instagram" 
//                   className="h-6 w-6"
//                 />
//               </a>
//               <a
//                 href="https://www.linkedin.com/in/mariyam-chauhdry-592231270"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="LinkedIn"
//                 className="hover:opacity-80 transition duration-300"
//               >
//                 <img 
//                   src="/linkedin-icon.jpg" 
//                   alt="LinkedIn" 
//                   className="h-6 w-6"
//                 />
//               </a>
//             </div>
//           </div>

//           {/* Navigation Links */}
//           <div className="flex space-x-6">
//             <Link
//               to="/home"
//               className="text-gray-300 hover:text-purple-400 transition duration-300"
//             >
//               Home
//             </Link>
//             <Link
//               to="/about"
//               className="text-gray-300 hover:text-purple-400 transition duration-300"
//             >
//               About
//             </Link>
//             <Link
//               to="/contact"
//               className="text-gray-300 hover:text-purple-400 transition duration-300"
//             >
//               Contact
//             </Link>
//             <Link
//               to="/favorites"
//               className="text-gray-300 hover:text-purple-400 transition duration-300"
//             >
//               My Favorites
//             </Link>
//           </div>
//         </div>

//         {/* Bottom Section: Copyright */}
//         <div className="mt-6 border-t border-purple-700 pt-4 text-center">
//           <p className="text-sm text-gray-400">
//             &copy; {new Date().getFullYear()} Mood Conexus. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;