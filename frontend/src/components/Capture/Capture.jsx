import { useState, useRef, useEffect } from "react";
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";
import * as faceapi from 'face-api.js';
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Recommendations from "../Recommendation/Recommendations";

const Capture = () => {
  // State management
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [emotion, setEmotion] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  // Refs
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      setError("");
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Face-api.js models loaded successfully");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading models:", err);
        setError(`Failed to load facial recognition models: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Camera control functions
  const handleOpenCamera = async () => {
    try {
      setError("");
      const constraints = { 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 },
          advanced: [{ exposureMode: "continuous", brightness: 128 }]
        } 
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError(`Unable to access the camera: ${error.message}`);
    }
  };

  const handleCloseCamera = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setEmotion("");
  };

  // Video stream handling
  useEffect(() => {
    if (videoRef.current && stream && cameraActive) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
        setError("Error starting video stream. Please try again.");
      });
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraActive, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [stream]);

  // Face detection
  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded || videoRef.current.paused || 
        videoRef.current.ended || !videoRef.current.videoWidth) {
      return null;
    }
    
    try {
      const options = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 512, 
        scoreThreshold: 0.4
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceExpressions();
        
      return detection;
    } catch (err) {
      console.error("Error in face detection:", err);
      return null;
    }
  };

  // Continuous face detection
  const startContinuousDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    detectionIntervalRef.current = setInterval(async () => {
      const detection = await detectFace();
      
      if (detection && detection.expressions) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const dominantEmotion = sorted[0][0];
        const confidenceScore = sorted[0][1].toFixed(2);
        
        setEmotion(`${dominantEmotion} (${confidenceScore})`);
      } else {
        setEmotion("No face detected. Please sit facing the light.");
      }
    }, 1000);
  };

  // Backend communication
  const sendToBackend = async (emotionData) => {
    try {
      const response = await fetch('http://localhost:5000/api/emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emotionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Successfully sent to backend:', data);
      return data;
    } catch (error) {
      console.error('Error sending to backend:', error);
      throw error;
    }
  };

  // Capture handler
  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded) {
      setError("Camera not ready or models not loaded yet");
      return;
    }

    setIsLoading(true);
    setError("");
    setRecommendations(null);
    
    try {
      if (videoRef.current.paused || videoRef.current.ended || 
          !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        throw new Error("Video stream is not ready");
      }

      console.log("Attempting to detect face...");
      
      const options = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 512, 
        scoreThreshold: 0.4 
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detection && detection.expressions) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const dominantEmotion = sorted[0][0];
        const confidenceScore = sorted[0][1].toFixed(2);
        
        const emotionText = `${dominantEmotion} (${confidenceScore})`;
        setEmotion(emotionText);
        console.log(`Detected Emotion: ${dominantEmotion} with confidence ${confidenceScore}`);

        // Capture image
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Draw face detection box
        if (detection.detection) {
          const { box } = detection.detection;
          ctx.strokeStyle = "#FF0000";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          
          ctx.font = "20px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(`${dominantEmotion} (${confidenceScore})`, box.x, box.y - 10);
        }

        const imageUrl = canvas.toDataURL("image/jpeg", 0.7);
        
        // Prepare data for backend
        const emotionData = {
          emotion: dominantEmotion,
          confidence: parseFloat(confidenceScore),
          timestamp: new Date().toISOString(),
          imageUrl: imageUrl
        };

        // Send to backend and get recommendations
        const backendResponse = await sendToBackend(emotionData);
        setRecommendations(backendResponse);
        setShowRecommendations(true);
        
        // Save to Firestore if authenticated
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          try {
            await addDoc(collection(db, "emotions"), {
              emotion: dominantEmotion,
              confidence: parseFloat(confidenceScore),
              timestamp: serverTimestamp(),
              email: user.email,
              imageUrl: imageUrl
            });
            console.log("Emotion saved to Firestore");
          } catch (dbError) {
            console.error("Error saving emotion:", dbError);
            setError("Emotion detected but failed to save to database.");
          }
        } else {
          setError("User not authenticated. Sign in to save emotions.");
        }
      } else {
        setEmotion("No face detected");
        setError("No face was detected. Adjust your position and lighting.");
      }
    } catch (err) {
      console.error("Error during face detection:", err);
      setError(`Detection failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Favorites management
  const toggleFavorite = (item, type) => {
    const itemKey = `${type}-${item.title}`;
    setFavorites(prev => 
      prev.includes(itemKey) 
        ? prev.filter(fav => fav !== itemKey) 
        : [...prev, itemKey]
    );
  };

  const closeRecommendations = () => {
    setShowRecommendations(false);
    setRecommendations(null);
  };

  // Start detection when camera is active
  useEffect(() => {
    if (cameraActive && modelsLoaded && videoRef.current) {
      const timer = setTimeout(() => {
        startContinuousDetection();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [cameraActive, modelsLoaded]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-200 relative">
      <nav className="bg-dark-blue py-4 px-6 shadow-md">
        <Navigation />
      </nav>

      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-100">Scanning Mode</h1>
          <p className="text-gray-400 mt-2">Activate your laptop camera to start scanning.</p>
          
          {!modelsLoaded && !error && (
            <p className="text-yellow-400 mt-2">Loading facial recognition models...</p>
          )}
          
          {modelsLoaded && (
            <p className="text-green-400 mt-2">Models loaded successfully!</p>
          )}
          
          {error && (
            <p className="text-red-400 mt-2">{error}</p>
          )}
        </div>

        <div className="w-full max-w-md h-72 bg-gray-800 rounded-lg flex items-center justify-center mb-6 relative">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                autoPlay
                playsInline
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <p className="text-white">Processing...</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Camera is currently inactive.</p>
          )}
        </div>

        {emotion && (
          <div className="text-lg font-semibold text-green-400 mb-4">
            Current Emotion: {emotion}
          </div>
        )}

        <div className="flex space-x-4">
          {!cameraActive ? (
            <button
              onClick={handleOpenCamera}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition duration-300 hover:bg-blue-800"
              disabled={isLoading}
            >
              Open Camera
            </button>
          ) : (
            <>
              <button
                onClick={handleCapture}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold transition duration-300 hover:bg-yellow-600"
                disabled={!modelsLoaded || isLoading}
              >
                {isLoading ? "Processing..." : "Capture Image"}
              </button>
              <button
                onClick={handleCloseCamera}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition duration-300 hover:bg-red-800"
                disabled={isLoading}
              >
                Close Camera
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recommendations Modal - Now fully handled by Recommendations component */}
      {showRecommendations && recommendations && (
        <Recommendations 
          animeRecs={recommendations.anime_recommendations || []}
          bookRecs={recommendations.book_recommendations || []}
          emotion={recommendations.emotion}
          onClose={closeRecommendations}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      <footer className="bg-dark-blue py-4 text-center text-gray-300">
        <Footer />
      </footer>
    </div>
  );
};

export default Capture;