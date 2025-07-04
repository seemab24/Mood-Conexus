import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSelector } from 'react-redux';

const Recommendations = ({ 
  animeRecs = [], 
  bookRecs = [], 
  emotion = "",
  onClose
}) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('anime');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [processingFavorite, setProcessingFavorite] = useState(null);

  const items = activeTab === 'anime' ? animeRecs : bookRecs;
  const itemsPerPage = 3;
  const totalSlides = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Load user's favorites
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const loadFavorites = async () => {
      try {
        const animeSnapshot = await getDocs(
          query(collection(db, "favorite"), where("email", "==", user.email))
        );
        const animeKeys = animeSnapshot.docs.map(doc => `anime-${doc.data().name}`);
        
        const bookSnapshot = await getDocs(
          query(collection(db, "favoriteBook"), where("email", "==", user.email))
        );
        const bookKeys = bookSnapshot.docs.map(doc => `books-${doc.data().name}`);
        
        setFavorites([...animeKeys, ...bookKeys]);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, [isAuthenticated, user?.email]);

  // Auto-rotate slides
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 7000);
    return () => clearInterval(interval);
  }, [totalSlides, activeTab]);

  const currentItems = items.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  const handleNext = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
  const handlePrev = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);

  const getShortDescription = (desc) => {
    if (!desc) return 'No description available';
    return desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;
  };

  const toggleFavorite = async (item, type) => {
    if (!isAuthenticated || !user?.email) {
      alert('Please login to add favorites');
      return;
    }

    const itemKey = `${type}-${item.title}`;
    const collectionName = type === 'anime' ? 'favorite' : 'favoriteBook';
    setProcessingFavorite(itemKey);

    try {
      const q = query(
        collection(db, collectionName),
        where("email", "==", user.email),
        where("name", "==", item.title)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, collectionName), {
          email: user.email,
          name: item.title,
          description: item.description,
          rating: item.rating,
          image: item.thumbnail,
          link: item.previewlink,
          createdAt: serverTimestamp()
        });
        setFavorites(prev => [...prev, itemKey]);
      } else {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setFavorites(prev => prev.filter(fav => fav !== itemKey));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setProcessingFavorite(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-purple-950 rounded-xl border border-purple-700">
        {/* Header with inline tabs */}
        <div className="flex justify-between items-center p-6 border-b border-purple-700">
          <h2 className="text-2xl font-bold text-purple-200">
            Recommended {emotion} Content
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-purple-900 rounded-full p-1">
              <button
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === 'anime' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-300 hover:bg-purple-800'
                }`}
                onClick={() => { setActiveTab('anime'); setCurrentSlide(0); }}
              >
                Anime
              </button>
              <button
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === 'books' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-300 hover:bg-purple-800'
                }`}
                onClick={() => { setActiveTab('books'); setCurrentSlide(0); }}
              >
                Books
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 pb-8">
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {currentItems.map((item) => {
                const itemKey = `${activeTab}-${item.title}`;
                const isFavorite = favorites.includes(itemKey);
                const isProcessing = processingFavorite === itemKey;
                
                return (
                  <div key={itemKey} className="bg-purple-900 rounded-lg p-4 flex flex-col items-center">
                    <div className="h-60 mb-4 flex justify-center">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-52 h-60 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 text-center">
                      {item.title}
                    </h3>
                    <p className="text-purple-300 text-sm mb-2 text-center">
                      Rating: {item.rating || 'N/A'}
                    </p>
                    <div className="flex-grow">
                      <p className="text-purple-200 text-xs mb-3 text-center h-16 flex items-center justify-center">
                        {getShortDescription(item.description)}
                      </p>
                    </div>
                    <div className="flex justify-center items-center space-x-3">
                      <Link
                        to={item.previewlink}
                        target="_blank"
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1 rounded text-sm"
                      >
                        {activeTab === 'anime' ? 'Watch Now' : 'Read Now'}
                      </Link>
                      <button
                        onClick={() => toggleFavorite(item, activeTab)}
                        className="text-xl text-red-500 hover:text-red-400"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-red-500 rounded-full"></div>
                        ) : isFavorite ? (
                          <FaHeart className="fill-current" />
                        ) : (
                          <FaRegHeart className="fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full shadow-lg"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full shadow-lg"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`mx-2 w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-purple-400 w-4' : 'bg-purple-800'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          )}
          {/* External Explore Links */}
<div className="mt-6 text-center text-purple-300 text-sm">
  {activeTab === 'anime' ? (
    <>
      You can also explore these anime at{' '}
      <a
        href="https://9animetv.to/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:underline"
      >
        9AnimeTV
      </a>.
    </>
  ) : (
    <>
      You can also explore these books at{' '}
      <a
        href="https://oceanofpdf.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:underline"
      >
        Ocean of PDF
      </a>.
    </>
  )}
</div>

        </div>
      </div>
    </div>
  );
};

Recommendations.propTypes = {
  animeRecs: PropTypes.array,
  bookRecs: PropTypes.array,
  emotion: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

Recommendations.defaultProps = {
  animeRecs: [],
  bookRecs: [],
  emotion: ''
};

export default Recommendations;