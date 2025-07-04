import { useState, useEffect } from "react";
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa"; // Heart icons for favorite/unfavorite
//import axios from "axios";
import { useSelector } from "react-redux";
// import { db, auth } from "../firebase/firebaseConfig"; // Import the Firestore db and auth
import { db , auth } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"; // Import Firestore functions
import { onAuthStateChanged } from "firebase/auth"; // Import auth state tracking

const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [api2List, setApi2List] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState("purple"); // State for theme
  const [favorites, setFavorites] = useState([]); // State for favorites
  const [favoriteBooks, setFavoriteBooks] = useState([]); // State for favorite books
  const { user } = useSelector((state) => state.auth);
  const [currentUser, setCurrentUser] = useState(null); // Firebase auth user
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Track Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  
  useEffect(() => {
    // Fetch anime data from Api.json
    fetch("/Api.json")
      .then((response) => response.json())
      .then((data) => setAnimeList(data))
      .catch((error) => console.error("Error fetching anime data:", error));

    // Fetch data from Api2.json (books data)
    fetch("/Api2.json")
      .then((response) => response.json())
      .then((data) => setApi2List(data))
      .catch((error) => console.error("Error fetching Api2 data:", error));
      
    // Only fetch favorites if user is logged in
    if (currentUser) {
      fetchFavorites();
      fetchFavoriteBooks();
    }
  }, [currentUser]);

  // Fetch favorite items from Firestore
  const fetchFavorites = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const favoriteQuery = query(
        collection(db, "favorite"),
        where("email", "==", currentUser.email)
      );
      const querySnapshot = await getDocs(favoriteQuery);
      const favoritesData = [];
      querySnapshot.forEach((doc) => {
        favoritesData.push({ id: doc.id, ...doc.data() });
      });
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setPopupMessage("Error loading favorites. Please try again later.");
      setTimeout(() => setPopupMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorite books from Firestore
  const fetchFavoriteBooks = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const favoriteBookQuery = query(
        collection(db, "favoriteBook"),
        where("email", "==", currentUser.email)
      );
      const querySnapshot = await getDocs(favoriteBookQuery);
      const favoriteBookData = [];
      querySnapshot.forEach((doc) => {
        favoriteBookData.push({ id: doc.id, ...doc.data() });
      });
      setFavoriteBooks(favoriteBookData);
    } catch (error) {
      console.error("Error fetching favorite books:", error);
      setPopupMessage("Error loading favorite books. Please try again later.");
      setTimeout(() => setPopupMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Slider automatic transition for Anime List
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext(); // Automatically move to the next slide
    }, 10000); // Change every 10 seconds
    return () => clearInterval(interval);
  }, [currentSlide, animeList]);

  const handleNext = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide + 1 >= Math.ceil(animeList.length / 3) ? 0 : prevSlide + 1
    );
  };

  const handlePrevious = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide - 1 < 0 ? Math.ceil(animeList.length / 3) - 1 : prevSlide - 1
    );
  };

  // Helper function to split the animeList into groups of 3
  const chunkAnimeList = (list) => {
    const chunks = [];
    for (let i = 0; i < list.length; i += 3) {
      chunks.push(list.slice(i, i + 3));
    }
    return chunks;
  };

  // Handle theme change
  const changeTheme = () => {
    if (theme === "purple") {
      setTheme("blue");
    } else if (theme === "blue") {
      setTheme("grey");
    } else if (theme === "grey") {
      setTheme("red");
    } else if (theme === "red") {
      setTheme("green");
    }//else if (theme === "green") {
    //   setTheme("pink");
    // }
     else {
      setTheme("purple");
    }
  };

  // Check if anime is in favorites
  const isAnimeFavorite = (animeId) => {
    return favorites.some((fav) => fav.originalId === animeId);
  };

  // Check if book is in favorites
  const isBookFavorite = (bookId) => {
    return favoriteBooks.some((fav) => fav.originalId === bookId);
  };

  // Toggle favorite status for anime
  const toggleFavorite = async (anime) => {
    if (!currentUser) {
      setPopupMessage("Please login to add favorites");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }

    const isFavorited = isAnimeFavorite(anime.id);
    
    if (isFavorited) {
      // Find the document ID to delete
      const favoriteToDelete = favorites.find(fav => fav.originalId === anime.id);
      if (favoriteToDelete) {
        try {
          // Delete from Firestore
          await deleteDoc(doc(db, "favorite", favoriteToDelete.id));
          
          // Update local state
          setFavorites(prevFavorites => 
            prevFavorites.filter(fav => fav.id !== favoriteToDelete.id)
          );
          
          setPopupMessage("Removed from favorites!");
          setTimeout(() => setPopupMessage(""), 3000);
        } catch (error) {
          console.error("Error removing favorite:", error);
          setPopupMessage("Error removing favorite: " + error.message);
          setTimeout(() => setPopupMessage(""), 3000);
        }
      }
    } else {
      // Add to favorites
      const favoriteData = {
        name: anime.name,
        rating: anime.rating,
        description: anime.description,
        image: anime.image,
        link: anime.link,
        email: currentUser.email,
        originalId: anime.id, // Store original ID to track which item was favorited
        timestamp: new Date()
      };

      try {
        // Save to Firestore
        const docRef = await addDoc(collection(db, "favorite"), favoriteData);
        
        // Update local state with the new document ID
        setFavorites(prevFavorites => [
          ...prevFavorites, 
          { id: docRef.id, ...favoriteData }
        ]);
        
        setPopupMessage("Added to favorites!");
        setTimeout(() => setPopupMessage(""), 3000);
      } catch (error) {
        console.error("Error adding favorite:", error);
        setPopupMessage("Error adding favorite: " + error.message);
        setTimeout(() => setPopupMessage(""), 3000);
      }
    }
  };
  
  // Toggle favorite book
  const toggleFavoriteBook = async (book) => {
    if (!currentUser) {
      setPopupMessage("Please login to add favorite books");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }

    const isFavorited = isBookFavorite(book.id);
    
    if (isFavorited) {
      // Find the document ID to delete
      const bookToDelete = favoriteBooks.find(fav => fav.originalId === book.id);
      if (bookToDelete) {
        try {
          // Delete from Firestore
          await deleteDoc(doc(db, "favoriteBook", bookToDelete.id));
          
          // Update local state
          setFavoriteBooks(prevFavorites => 
            prevFavorites.filter(fav => fav.id !== bookToDelete.id)
          );
          
          setPopupMessage("Removed from favorite books!");
          setTimeout(() => setPopupMessage(""), 3000);
        } catch (error) {
          console.error("Error removing favorite book:", error);
          setPopupMessage("Error removing favorite book: " + error.message);
          setTimeout(() => setPopupMessage(""), 3000);
        }
      }
    } else {
      // Add to favorites
      const favoriteData = {
        name: book.name,
        rating: book.rating,
        description: book.description,
        image: book.image,
        link: book.link,
        email: currentUser.email,
        originalId: book.id, // Store original ID to track which book was favorited
        timestamp: new Date()
      };

      try {
        // Save to Firestore
        const docRef = await addDoc(collection(db, "favoriteBook"), favoriteData);
        
        // Update local state with the new document ID
        setFavoriteBooks(prevFavorites => [
          ...prevFavorites, 
          { id: docRef.id, ...favoriteData }
        ]);
        
        setPopupMessage("Added to favorite books!");
        setTimeout(() => setPopupMessage(""), 3000);
      } catch (error) {
        console.error("Error adding favorite book:", error);
        setPopupMessage("Error adding favorite book: " + error.message);
        setTimeout(() => setPopupMessage(""), 3000);
      }
    }
  };

  // Determine theme styles
  const themeStyles = {
    purple: {
      bgColor: "bg-purple-950",
      textColor: "text-purple-200",
      buttonColor: "bg-purple-500",
      buttonHoverColor: "hover:bg-purple-600",
      sliderBgColor: "bg-purple-900",
    },
    blue: {
      bgColor: "bg-blue-900",
      textColor: "text-white",
      buttonColor: "bg-blue-500",
      buttonHoverColor: "hover:bg-blue-600",
      sliderBgColor: "bg-blue-800",
    },
    grey: {
      bgColor: "bg-gray-700",
      textColor: "text-gray-300",
      buttonColor: "bg-gray-500",
      buttonHoverColor: "hover:bg-gray-600",
      sliderBgColor: "bg-gray-700",
    },
    red: {
      bgColor: "bg-red-900",
      textColor: "text-red-200",
      buttonColor: "bg-red-500",
      buttonHoverColor: "hover:bg-red-600",
      sliderBgColor: "bg-red-800",
    },
    green: {
      bgColor: "bg-green-800",
      textColor: "text-green-200",
      buttonColor: "bg-green-500",
      buttonHoverColor: "hover:bg-green-600",
      sliderBgColor: "bg-green-700",
    },
    pink: {
      bgColor: "bg-pink-800",
      textColor: "text-pink-200",
      buttonColor: "bg-pink-500",
      buttonHoverColor: "hover:bg-pink-600",
      sliderBgColor: "bg-pink-700",
    },
  };

  return (
    <div
      className={`${themeStyles[theme].bgColor} ${themeStyles[theme].textColor} min-h-screen flex flex-col transition-colors duration-500`}
    >
      {/* Navbar Component */}
      <Navigation />
      {popupMessage && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-green-500 text-white p-4 rounded-md shadow-md z-50"
          style={{ width: "auto", maxWidth: "300px", textAlign: "center" }}
        >
          {popupMessage}
        </div>
      )}
      {/* Main Content */}
      <div className="flex-grow container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side div */}
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-200">
            Capture Your Mood
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Discover the beauty of self-expression and connect with your inner
            emotions. Let Mood Conexus guide you through your journey.
          </p>
          <Link
            to="/capture"
            className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} text-white text-center px-6 py-3 rounded-lg text-lg font-bold transition duration-300`}
            aria-label="Capture Mood"
          >
            Capture Mood

            
          </Link>

          {/* <Link
             to="/resources"
             className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} fixed bottom-8 left-8 text-white text-center px-6 py-3 rounded-lg text-lg font-bold transition duration-300`}
             aria-label="Go to Resources"
>
               View Resources
          </Link> */}
        </div>
        
        {/* Right side div */}
        <div className="flex items-center justify-center">
          <img
            src="gif.gif" //  GIF location
            alt="Your GIF description"
            className="w-full h-full rounded-l-full object-fill"
          />
        </div>
      </div>

      {/* Anime Slider */}
      <div
        className={`relative w-full mt-8 overflow-hidden ${themeStyles[theme].sliderBgColor}`}
      >
        {animeList.length > 0 && (
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {chunkAnimeList(animeList).map((animeGroup, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full flex items-center justify-center"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {animeGroup.map((anime) => (
                    <div key={anime.id} className="text-center p-6">
                      <img
                        src={anime.image}
                        alt={anime.name}
                        className="w-52 h-60 object-center rounded-lg mb-4 mx-auto"
                      />
                      <h2
                        className={`text-2xl font-bold ${themeStyles[theme].textColor} mb-2`}
                      >
                        {anime.name}
                      </h2>
                      <p
                        className={`text-sm mb-2 ${themeStyles[theme].textColor}`}
                      >
                        Rating: {anime.rating}
                      </p>
                      <p className="text-gray-400 mb-4 h-20 overflow-hidden">{anime.description}</p>
                      <Link
                        to={anime.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} text-white px-4 py-2 rounded-lg transition duration-300`}
                      >
                        Watch Now
                      </Link>
                      <button
                        onClick={() => toggleFavorite(anime)}
                        className="text-xl mt-2 ml-3"
                      >
                        {isAnimeFavorite(anime.id) ? (
                          <FaHeart className="text-red-500 opacity-100 fill-current" />
                        ) : (
                          <FaRegHeart className="text-gray-400 opacity-100 fill-current" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} absolute top-40 left-8 transform -translate-y-1/2 p-3 rounded-full`}
          onClick={handlePrevious}
          aria-label="Previous Slide"
        >
          &lt;
        </button>
        <button
          className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} absolute top-40 right-8 transform -translate-y-1/2 p-3 rounded-full`}
          onClick={handleNext}
          aria-label="Next Slide"
        >
          &gt;
        </button>
      </div>

      {/* Book Slider */}
      <div
        className={`relative w-full mt-8 overflow-hidden ${themeStyles[theme].sliderBgColor}`}
      >
        {api2List.length > 0 && (
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {chunkAnimeList(api2List).map((bookGroup, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full flex items-center justify-center"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookGroup.map((book) => (
                    <div key={book.id} className="text-center p-6">
                      <img
                        src={book.image}
                        alt={book.name}
                        className="w-52 h-60 object-center rounded-lg mb-4 mx-auto"
                      />
                      <h2
                        className={`text-2xl font-bold ${themeStyles[theme].textColor} mb-2`}
                      >
                        {book.name}
                      </h2>
                      <p
                        className={`text-sm mb-2 ${themeStyles[theme].textColor}`}
                      >
                        Author: {book.rating}
                      </p>
                      <p className="text-gray-400 mb-4 h-20 overflow-hidden">{book.description}</p>
                      <Link
                        to={book.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} text-white px-4 py-2 rounded-lg transition duration-300`}
                      >
                        Read Now
                      </Link>
                      <button
                        onClick={() => toggleFavoriteBook(book)}
                        className="text-xl mt-2 ml-3"
                      >
                        {isBookFavorite(book.id) ? (
                          <FaHeart className="text-red-500 opacity-100 fill-current" />
                        ) : (
                          <FaRegHeart className="text-gray-400 opacity-100 fill-current" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} absolute top-40 left-8 transform -translate-y-1/2 p-3 rounded-full`}
          onClick={handlePrevious}
          aria-label="Previous Slide"
        >
          &lt;
        </button>
        <button
          className={`${themeStyles[theme].buttonColor} ${themeStyles[theme].buttonHoverColor} absolute top-40 right-8 transform -translate-y-1/2 p-3 rounded-full`}
          onClick={handleNext}
          aria-label="Next Slide"
        >
          &gt;
        </button>
      </div>

      {/* Change Theme Button */}
      <button
        onClick={changeTheme}
        className="fixed bottom-8 right-8 bg-white text-purple-950 font-bold rounded-md hover:bg-black hover:text-white p-2"
      >
        Click me
      </button>

      

      <Footer />
    </div>
  );
};

export default Home;