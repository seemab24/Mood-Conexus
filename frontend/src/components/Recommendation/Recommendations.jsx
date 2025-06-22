import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Recommendations = ({ 
  animeRecs = [], 
  bookRecs = [], 
  emotion = "",
  onClose,
  favorites = [],
  toggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState('anime');
  const [currentSlide, setCurrentSlide] = useState(0);
  const items = activeTab === 'anime' ? animeRecs : bookRecs;
  const itemsPerPage = 3;
  const totalSlides = Math.max(1, Math.ceil(items.length / itemsPerPage));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 10000);
    return () => clearInterval(interval);
  }, [totalSlides, activeTab]);

  const currentItems = items.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  const handleNext = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
  const handlePrev = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);

  // Get first 100 characters of description
  const getShortDescription = (desc) => {
    if (!desc) return 'No description available';
    return desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-purple-950 rounded-xl border border-purple-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-200">
              Recommended {emotion} Content
            </h2>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <button
              className={`px-6 py-2 mx-2 rounded-full font-medium ${
                activeTab === 'anime' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-900 text-purple-300 hover:bg-purple-800'
              }`}
              onClick={() => { setActiveTab('anime'); setCurrentSlide(0); }}
            >
              Anime
            </button>
            <button
              className={`px-6 py-2 mx-2 rounded-full font-medium ${
                activeTab === 'books' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-900 text-purple-300 hover:bg-purple-800'
              }`}
              onClick={() => { setActiveTab('books'); setCurrentSlide(0); }}
            >
              Books
            </button>
          </div>

          {/* Slider Content */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {currentItems.map((item) => {
                const itemKey = `${activeTab}-${item.title}`;
                const isFavorite = favorites.includes(itemKey);
                
                return (
                  <div key={itemKey} className="bg-purple-900 rounded-lg p-4 flex flex-col">
                    <div className="h-40 overflow-hidden rounded-lg mb-3">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
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
                        aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
                      >
                        {isFavorite ? (
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full"
                >
                  &lt;
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full"
                >
                  &gt;
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
                  className={`mx-1 w-2 h-2 rounded-full ${
                    currentSlide === index ? 'bg-purple-400' : 'bg-purple-800'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Recommendations.propTypes = {
  animeRecs: PropTypes.array,
  bookRecs: PropTypes.array,
  emotion: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  favorites: PropTypes.array,
  toggleFavorite: PropTypes.func.isRequired
};

Recommendations.defaultProps = {
  animeRecs: [],
  bookRecs: [],
  emotion: '',
  favorites: []
};

export default Recommendations;