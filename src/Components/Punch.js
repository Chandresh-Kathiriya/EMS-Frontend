// src/Components/Punch

// Import Core module
import React, { useRef, useState, useCallback, useEffect, useContext } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // CSS for toast
import { PermissionContext } from '../Context/PermissionContext';
import { getDistance } from 'geolib';

// import required Components
import { apiCall } from '../Components/API';


function Punch({ cameraRef }) {
  const { punchData, locationMaster } = useContext(PermissionContext);
  const webcamRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const userId = localStorage.getItem('id')
  const token = localStorage.getItem('token')

  // Capture the image and upload it
  const capture = useCallback(async () => {
    setIsUploading(true);
    let imageURL = '';

    // If image is required
    if (punchData.image) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
          throw new Error('Webcam not available or image capture failed.');
        }
        const imageBlob = await fetch(imageSrc).then((res) => res.blob());
        const file = new File([imageBlob], 'attendance.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);

        const response = await apiCall(`productivity/upload?fileFor=attendance`, token, 'POST', formData);
        imageURL = response.imageURL;
      } catch (err) {
        toast.error('Image capture failed or permission denied. Attendance not marked.');
        setIsUploading(false);
        return;
      }
    }

    // Get location
    let latitude, longitude;
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            const pointA = { latitude: latitude, longitude: longitude }
            const pointB = { latitude: locationMaster?.latitude, longitude: locationMaster?.longitude }
            const distanceInMeters = getDistance(pointA, pointB);
            if (locationMaster?.isRangeRequired) {
              if (locationMaster.rangeArea < distanceInMeters) {
                toast.error('You are out of range!')
                reject(new Error("User is out of range"));
                return;
              } 
            }
            resolve();
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    } catch (err) {
      toast.error('Failed to fetch location. Attendance not marked.');
      setIsUploading(false);
      return;
    }

    // Prepare payload
    const formDataForAttendance = {
      userId: userId,
      latitude: latitude,
      longitude: longitude,
      ...(punchData.image && { imageURL })
    };

    // Final API call
    try {
      const responsePunch = await apiCall('attendance/punch', token, 'POST', formDataForAttendance);
      if (responsePunch.success === true) {
        toast.success(responsePunch.message);
      } else {
        toast.error(responsePunch.message);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Error uploading attendance: ' + error.message);
      }
    } finally {
      setIsUploading(false);
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
      setIsWebcamActive(false);
      setIsOffCanvasOpen(false);
    }
  }, [webcamStream, punchData.image]);



  // Start the webcam
  const startWebcam = () => {
    if (isWebcamActive) return;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setIsWebcamActive(true);
        setWebcamStream(stream);
        setIsOffCanvasOpen(true);

        if (webcamRef.current && webcamRef.current.video) {
          webcamRef.current.video.srcObject = stream;
        }
      })
      .catch((err) => {
        if (punchData.image) {
          toast.error('Webcam access is required to mark attendance.');
        } else {
          toast.warn('Webcam permission denied. Proceeding without image.');
          setIsOffCanvasOpen(true); // Still allow punching without webcam
        }
      });
  };

  // Cleanup webcam stream on off-canvas close
  useEffect(() => {
    if (!isOffCanvasOpen && webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setIsWebcamActive(false);
    }
  }, [isOffCanvasOpen, webcamStream]);

  return (
    <>
      {/* Camera Icon: Only show when off-canvas is not open */}
      {!isOffCanvasOpen && (
        <div onClick={startWebcam} className="camera-icon-container px-2 py-1" style={{ border: '1px solid #78adc4', borderRight: '0', backgroundColor: '#fff', borderRadius: '20% 0 0 20%', cursor: 'pointer' }}>
          <i
            ref={cameraRef} // Attach ref here
            className="fas fa-camera"
            style={{ color: '#78adc4', fontSize: '15px' }}
          ></i>
        </div>
      )}

      {/* Overlay: When off-canvas is open, it shows the overlay */}
      {isOffCanvasOpen && (
        <div className="overlay" onClick={() => setIsOffCanvasOpen(false)}></div>
      )}

      {/* Off-canvas: Shows when webcam is active */}
      <div className={`off-canvas ${isOffCanvasOpen ? 'open' : ''}`} style={{ zIndex: '2000' }}>
        <div className="off-canvas-content">
          <div className="offcanvas-header mb-0"
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <h5 className='mb-0'>Attendance</h5>
            <div style={{ marginLeft: '20px' }}>
              <button
                type="button"
                onClick={() => setIsOffCanvasOpen(false)}
                className="btn bgnone mt-0"
                style={{ color: '#fd6f6f', border: '1px solid #fd6f6f' }}
              >
                <i className="fas fa-circle-xmark"></i> Cancel
              </button>
            </div>
          </div>
          <hr style={{ width: '100%' }} />

          {isWebcamActive && (
            <>
              <div>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="300px"
                  videoConstraints={{ facingMode: 'user' }}
                />
              </div>
            </>
          )}
          <>
            <div>
              <button
                type="button"
                className="btn mx-1"
                onClick={capture}
                style={{ color: '#338db5', border: '1px solid #338db5' }}
                disabled={isUploading} // Disable the button when uploading
              >
                {isUploading ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-circle-check"></i>
                )}
                &nbsp;{isUploading ? 'Uploading...' : 'Mark Attendance'}
              </button>
            </div>
          </>

        </div>
      </div>

      {/* Styles for the camera icon and off-canvas */}
      <style>{`
        .camera-icon-container {
          position: fixed;
          top: 40%;
          right: 0;
          transform: translateY(-50%);
          z-index: 1000;
        }

        .off-canvas {
          position: fixed;
          top: 0;
          right: -400px;
          width: auto; /* default for larger screens */
          height: 100%;
          background-color: white;
          transition: right 0.3s ease-in-out;
          box-shadow: -2px 0px 10px rgba(0, 0, 0, 0.1);
          z-index: 999;
          padding: 20px;
        }

        /* Responsive override for mobile devices */
        @media (max-width: 768px) {
          .off-canvas.open{
            width: -webkit-fill-available;
          }
        }

        .off-canvas.open {
          right: 0;
        }

        .off-canvas-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        button {
          margin-top: 10px;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }
      `}</style>
    </>
  );
}

export default Punch;