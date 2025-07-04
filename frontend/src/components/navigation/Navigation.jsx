
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../Redux/authSlice";

// Type definitions for the reusable components
const NavLink = ({ to, children }) => (
  <Link 
    to={to}
    className="text-white hover:text-purple-300 transition duration-300 px-2 py-1"
  >
    {children}
  </Link>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const MobileNavLink = ({ to, children }) => (
  <Link 
    to={to}
    className="text-white hover:text-purple-300 transition duration-300 px-3 py-2 rounded hover:bg-purple-700 block"
  >
    {children}
  </Link>
);

MobileNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const AuthButton = ({ 
  to, 
  children, 
  primary = false 
}) => (
  <Link
    to={to}
    className={`${primary ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white text-purple-600 hover:bg-gray-100'} 
      border border-purple-500 px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center`}
  >
    {children}
  </Link>
);

const Navigation = ({ theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log("Current user data:", user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Theme configuration
  const navStyles = {
    purple: "bg-purple-950 text-white",
    blue: "bg-blue-950 text-white",
    grey: "bg-gray-950 text-white",
    red: "text-red-400 bg-red-900",
    pink: "bg-pink-950 text-white",
  };

  // Get the best available display name
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) {
      // Extract and format name from email
      const nameFromEmail = user.email.split('@')[0];
      return nameFromEmail
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return 'User';
  };

  return (
    <nav className={`${navStyles[theme]} p-4 shadow-lg`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo and Main Navigation */}
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-full p-2 mr-3">
              <img
                src="/logo.jpeg" 
                alt="Logo"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <Link to="/home" className="text-2xl font-semibold text-white hover:text-purple-300 transition">
              Mood Conexus
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {isAuthenticated && <NavLink to="/favorites">My Favorites</NavLink>}
            {/* <NavLink to="/resources">Resources</NavLink> */}


            {/* <NavLink to="/help">Help</NavLink> */}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Authentication Section */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="text-white font-medium bg-purple-800 px-3 py-1 rounded-lg">
                Welcome, {getDisplayName()}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                aria-label="Logout"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <AuthButton to="/login">Login</AuthButton>
              <AuthButton to="/register" primary>Register</AuthButton>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-purple-900 mt-2 py-2 px-4 rounded-lg">
        <div className="flex flex-col space-y-2">
          <MobileNavLink to="/home">Home</MobileNavLink>
          <MobileNavLink to="/about">About</MobileNavLink>
          <MobileNavLink to="/contact">Contact</MobileNavLink>
          {isAuthenticated && <MobileNavLink to="/favorites">My Favorites</MobileNavLink>}
          {/* <MobileNavLink to="/resources">Resources</MobileNavLink> */}


          {/* <MobileNavLink to="/help">Help</MobileNavLink>   */}
        </div>
      </div>
    </nav>
  );
};

AuthButton.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  primary: PropTypes.bool,
};

Navigation.propTypes = {
  theme: PropTypes.string,
};

export default Navigation;