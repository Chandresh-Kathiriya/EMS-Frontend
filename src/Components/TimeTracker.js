import React, { useState, useEffect } from 'react';
import { apiCall } from './API';
import SelectInput from '../Components/SelectInput';

function TimeTracker() {
  const [task, setTask] = useState([]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [taskCode, setTaskCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('id');
  const token = localStorage.getItem('token');

  // Load timer state from localStorage on initial render
  useEffect(() => {
    const savedTimer = localStorage.getItem('timeTracker');
    if (savedTimer) {
      const { startTime, pausedTime, taskCode: savedTaskCode, message: savedMessage, accumulatedTime } = JSON.parse(savedTimer);

      if (pausedTime) {
        // Timer was paused - show accumulated time
        setHours(Math.floor(accumulatedTime / 3600));
        setMinutes(Math.floor((accumulatedTime % 3600) / 60));
        setSeconds(accumulatedTime % 60);
        setIsPaused(true);
      } else {
        // Timer was running - calculate elapsed time
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000) + (accumulatedTime || 0);
        setHours(Math.floor(elapsedSeconds / 3600));
        setMinutes(Math.floor((elapsedSeconds % 3600) / 60));
        setSeconds(elapsedSeconds % 60);
        setIsRunning(true);
      }

      setTaskCode(savedTaskCode);
      setMessage(savedMessage || '');
    }

  }, []);

  // Timer effect
  useEffect(() => {
    let interval;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds < 59) {
            return prevSeconds + 1;
          } else {
            setMinutes(prevMinutes => {
              if (prevMinutes < 59) {
                return prevMinutes + 1;
              } else {
                setHours(prevHours => prevHours + 1);
                return 0;
              }
            });
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const getTaskData = async () => {
    setLoading(true);
    try {
      const response = await apiCall('productivity/taskList', token, 'POST', null);
      setTask(response?.data)
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStopClick = async () => {
    if (isRunning) {
      // Pause the timer if it's running
      const accumulatedTime = hours * 3600 + minutes * 60 + seconds;
      const timerData = {
        startTime: null,
        taskCode,
        message,
        accumulatedTime,
        pausedTime: Date.now()
      };
      localStorage.setItem('timeTracker', JSON.stringify(timerData));
      setIsRunning(false);
      setIsPaused(true);
    } else {
      // Start or resume the timer
      if (!taskCode) {
        setError('Please Add Task Details Before Starting the Timer.');
        return;
      }

      const taskData = {
        userId,
        taskCode,
        message,
      };

      try {
        if (isPaused) {
          // Resuming from pause
          const accumulatedTime = hours * 3600 + minutes * 60 + seconds;
          const timerData = {
            startTime: Date.now(),
            taskCode,
            message,
            accumulatedTime,
            pausedTime: null
          };
          localStorage.setItem('timeTracker', JSON.stringify(timerData));
          setIsPaused(false);
          setIsRunning(true);
        } else {
          // Starting fresh timer
          const response = await apiCall('productivity/startTaskTimer', token, 'POST', taskData);

          const timerData = {
            startTime: Date.now(),
            taskCode,
            message,
            accumulatedTime: 0,
            pausedTime: null
          };
          localStorage.setItem('timeTracker', JSON.stringify(timerData));

          setHours(0);
          setMinutes(0);
          setSeconds(0);
          setIsRunning(true);
          setIsPaused(false);
        }
        setError('');
      } catch (error) {
        setError('Failed to start timer');
      }
    }
  };

  const handleResetPauseClick = async () => {
    if (isPaused) {
      // If paused, reset the timer and save the time to database
      try {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        // Only save if there was actually time tracked
        if (totalSeconds > 0) {
          const stopData = {
            userId,
            taskCode,
            hours,
            minutes,
            seconds,
            message
          };

          await apiCall('productivity/stopTaskTimer', token, 'POST', stopData);
        }

        // Reset the timer
        setIsRunning(false);
        setIsPaused(false);
        setTaskCode('');
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setMessage('');
        localStorage.removeItem('timeTracker');
        setError('');
      } catch (error) {
        setError('Failed to save time. Please try again.');
      }
    } else {
      // If running, pause the timer
      const accumulatedTime = hours * 3600 + minutes * 60 + seconds;
      const timerData = {
        startTime: null,
        taskCode,
        message,
        accumulatedTime,
        pausedTime: Date.now()
      };
      localStorage.setItem('timeTracker', JSON.stringify(timerData));
      setIsRunning(false);
      setIsPaused(true);
    }
  };

  const taskOptions = task?.map((task) => ({
    value: task.code,
    label: `${task.code} - ${task.name}`
  }));

  return (
    <>
      <button type="button" className="btn bgwhite mx-1 timetracker" data-bs-toggle="modal" data-bs-target="#verticalycentered" onClick={getTaskData}>
        <i className="fa-solid fa-stopwatch fa-xl"></i>
      </button>

      <div className="modal fade" id="verticalycentered" tabIndex="-1" aria-hidden="inert" style={{ display: "none" }}>
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><strong>Time Tracker</strong></h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body" style={{ overflow: 'auto' }}>
              <div className="justify-content-center px-2 pb-md-0 mb-20 modal-body">
                <div className=" px-md-3 row">
                  <div className="text-center col-4">
                    <div className="task-hours">{String(hours).padStart(2, '0')}</div>
                    <p className="task-time">Hours</p>
                  </div>
                  <div className="text-center col-4">
                    <div className="task-hours">{String(minutes).padStart(2, '0')}</div>
                    <p className="task-time">Minutes</p>
                  </div>
                  <div className="text-center col-4">
                    <div className="task-hours">{String(seconds).padStart(2, '0')}</div>
                    <p className="task-time">Seconds</p>
                  </div>
                </div>
                {error && <div style={{ color: '#7e4444' }}>{error}</div>}
                <div className="row justify-content-center mt-2">
                  <div className="col-lg-12 col-md-12 border-task">
                    <SelectInput
                      placeholder="Select Task"
                      value={taskOptions.find(option => option.value === taskCode) || null} 
                      onChange={(selectedOption) => setTaskCode(selectedOption?.value)} 
                      options={taskOptions}
                      isDisabled={isRunning || isPaused} 
                    />
                  </div>

                  <div className="col-12 mt-1">
                    <label className="form-label mt-2 mb-1">Message</label>
                    <textarea
                      type="text"
                      id="message"
                      name="message"
                      placeholder="Enter Message"
                      className="message-textarea p-2"
                      style={{ width: '100%', borderRadius: '5px' }}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isRunning || isPaused}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-center mt-2">
                  {/* Start/Stop Button */}
                  <button
                    className="btn bgnone my-2 mx-5"
                    onClick={handleStartStopClick}
                  >
                    {isRunning ? (
                      <i className="fa-solid fa-circle-pause fa-2xl" style={{ color: "#FFA500" }}></i>
                    ) : (
                      <i className="fa-solid fa-circle-play fa-2xl" style={{ color: "#008000" }}></i>
                    )}
                  </button>

                  {/* Reset/Pause Button */}
                  <button
                    className="btn bgnone my-2 mx-5"
                    onClick={handleResetPauseClick}
                  >
                    {isPaused ? (
                      <i className="fa-solid fa-arrow-rotate-right fa-2xl" style={{ color: "#7e4444" }}></i>
                    ) : isRunning ? (
                      <i className="fa-solid fa-circle-stop fa-2xl" style={{ color: "#FF0000" }}></i>
                    ) : (
                      <i className="fa-solid fa-arrow-rotate-right fa-2xl" style={{ color: "#7e4444" }}></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TimeTracker;