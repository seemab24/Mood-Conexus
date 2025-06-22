//import React from "react";
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";

const About = ({ theme, changeTheme }) => {
  // Define theme-specific styles
  const themeStyles = {
    purple: "text-purple-300 bg-purple-900",
    blue: "text-blue-400 bg-blue-900",
    grey: "text-gray-300 bg-gray-700",
    red: "text-red-400 bg-red-900",
    pink: "text-pink-300 bg-pink-800",
    green: "text-green-300 bg-green-900",
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles[theme]}`}>
      {/* Navbar Component */}
      <Navigation />

      {/* Floating Theme Toggle Button */}
      <button
        onClick={changeTheme}
        className="fixed bottom-8 right-8  bg-white text-purple-950 font-bold rounded-md hover:bg-black hover:text-white p-2"
        aria-label="Change Theme"
      >
        Click me
      </button>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-6 py-12">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">About Mood Conexus</h1>
          <p className="text-lg md:text-xl mt-4">
            Learn more about the platform that helps you connect with your
            emotions and explore the world of moods.
          </p>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">What We Offer</h2>
            <p>
              Mood Conexus is a platform designed to help individuals capture
              and explore their moods. Whether it's through journaling,
              self-expression, or connecting with like-minded individuals, our
              goal is to create a supportive environment for emotional growth.
            </p>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p>
              At Mood Conexus, we believe that understanding and expressing your
              emotions are key to personal development. We strive to provide
              tools and a community that inspire and empower you to connect with
              your inner self.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default About;

// import React from "react";
// import Navigation from "../navigation/Navigation";
// import Footer from "../footer/Footer";

// const About = () => {
//   return (
//     <div className="bg-black text-white min-h-screen flex flex-col">
//       {/* Navbar Component */}
//       <Navigation />

//       {/* Main Content */}
//       <div className="flex-grow container mx-auto px-6 py-12">
//         {/* Heading */}
//         <div className="mb-12 text-center">
//           <h1 className="text-4xl md:text-6xl font-bold text-purple-400">
//             About Mood Conexus
//           </h1>
//           <p className="text-lg md:text-xl text-gray-300 mt-4">
//             Learn more about the platform that helps you connect with your
//             emotions and explore the world of moods.
//           </p>
//         </div>

//         {/* Content Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Left Column */}
//           <div className="space-y-6">
//             <h2 className="text-3xl font-bold text-purple-300">
//               What We Offer
//             </h2>
//             <p className="text-gray-300">
//               Mood Conexus is a platform designed to help individuals capture
//               and explore their moods. Whether it's through journaling,
//               self-expression, or connecting with like-minded individuals, our
//               goal is to create a supportive environment for emotional growth.
//             </p>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             <h2 className="text-3xl font-bold text-purple-300">Our Mission</h2>
//             <p className="text-gray-300">
//               At Mood Conexus, we believe that understanding and expressing your
//               emotions are key to personal development. We strive to provide
//               tools and a community that inspire and empower you to connect with
//               your inner self.
//             </p>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default About;
