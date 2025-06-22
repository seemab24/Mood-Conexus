import { useState, useEffect } from "react";
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";
import { useSelector } from "react-redux";
import { FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { getDocs, query, where, deleteDoc, doc, collection } from "firebase/firestore";

const Favorites = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [favoriteAnimes, setFavoriteAnimes] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const animeSnapshot = await getDocs(
          query(collection(db, "favorite"), where("email", "==", user.email))
        );
        const animeData = animeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFavoriteAnimes(animeData);

        const bookSnapshot = await getDocs(
          query(collection(db, "favoriteBook"), where("email", "==", user.email))
        );
        const bookData = bookSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFavoriteBooks(bookData);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, user?.email]);

  const removeFavorite = async (id, type) => {
    try {
      setRemovingId(id);
      const collectionName = type === "anime" ? "favorite" : "favoriteBook";
      await deleteDoc(doc(db, collectionName, id));

      if (type === "anime") {
        setFavoriteAnimes((prev) => prev.filter((item) => item.id !== id));
      } else {
        setFavoriteBooks((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">

        {/* Anime Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-b border-purple-700 pb-2">Fav Anime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteAnimes.length > 0 ? (
              favoriteAnimes.map((anime) => (
                <div key={anime.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
                  
                  {/* Clear Heart Icon */}
                  <button
                    onClick={() => removeFavorite(anime.id, "anime")}
                    className="absolute top-3 right-3 z-20 p-1 rounded-full backdrop-blur-md bg-black/50 hover:bg-black/70 text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Remove from favorites"
                  >
                    {removingId === anime.id ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-red-500 rounded-full"></div>
                    ) : (
                      <FaHeart className="text-red-500 opacity-100 fill-current text-2xl shadow-lg drop-shadow-md hover:scale-110 transition-transform duration-200" />
                    )}
                  </button>

                  <Link to={anime.link || "#"} target="_blank" rel="noopener noreferrer">
                    <img
                      src={anime.image}
                      alt={anime.name}
                      className="w-60 h-60 object-bottom rounded-lg mb-4 mx-auto hover:opacity-90 transition-opacity"
                    />
                  </Link>

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1">{anime.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-3">{anime.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 text-sm">Rating: {anime.rating}</span>
                      <Link 
                        to={anime.link || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Watch Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No favorite anime yet</p>
                
              </div>
            )}
          </div>
        </section>

        {/* Book Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-b border-purple-700 pb-2">Fav Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteBooks.length > 0 ? (
              favoriteBooks.map((book) => (
                <div key={book.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
                  
                  {/* Clear Heart Icon */}
                  <button
                    onClick={() => removeFavorite(book.id, "book")}
                    className="absolute top-3 right-3 z-20 p-1 rounded-full backdrop-blur-md bg-black/50 hover:bg-black/70 text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Remove from favorites"
                  >
                    {removingId === book.id ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-red-500 rounded-full"></div>
                    ) : (
                      <FaHeart className="text-red-500 opacity-100 fill-current text-2xl shadow-lg drop-shadow-md hover:scale-110 transition-transform duration-200" />
                    )}
                  </button>

                  <Link to={book.link || "#"} target="_blank" rel="noopener noreferrer">
                    <img
                      src={book.image}
                      alt={book.name}
                      className="w-60 h-60 object-bottom rounded-lg mb-4 mx-auto hover:opacity-90 transition-opacity"
                    />
                  </Link>

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1">{book.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-3">{book.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 text-sm">Rating: {book.rating}</span>
                      <Link 
                        to={book.link || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Read Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No favorite books yet</p>
                
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;