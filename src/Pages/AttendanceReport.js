// src/Pages/AttendanceReport.js

// import core modules
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

// import require components
import Layout from '../Components/Layout';  // Import Layout component

import { fetchAttendanceReportData, fetchUserData, fetchWeekOffData, fetchHolidayData, fetchLeaveData } from '../redux/actions/attendanceReportActions';
import { ModalComponent } from '../Components/Model';

function AttendanceReport() {
  const token = localStorage.getItem('token');
  // if (!token) {
  //   toast.error('You must be logged in to view this page');
  //   window.location.href = '/login';
  // }

  const currentMonth = new Date().getMonth() + 1;
  const formattedMonth = currentMonth.toString().padStart(2, '0');

  const [selectedMonth, setSelectedMonth] = useState(formattedMonth);
  const [monthDays, setMonthDays] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [processedAttendanceData, setProcessedAttendanceData] = useState({});
  const [totalOfficialHours, setTotalOfficialHours] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bodyContent, setBodyContent] = useState(null);

  const dispatch = useDispatch();
  const { attendanceReportData, userData, weekOffData, holidayData, leaveData } = useSelector(
    (state) => state.attendanceReport
  );

  // Function to generate the days of the selected month
  const generateMonthDays = useCallback((month) => {
    const days = [];
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
      days.push({ day: i.toString().padStart(2, '0'), dayOfWeek });
    }
    setMonthDays(days);
  }, [selectedYear]);


  const calculateTotalOfficialWorkingHours = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const weekOffPolicy = weekOffData?.data?.[0]; // Use first policy
    const dayRules = weekOffPolicy?.days || {};
    const weekMap = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

    const holidayList = holidayData?.data || [];

    // Convert holiday ranges into a Set of date strings for quick checking
    const holidayDatesSet = new Set();
    holidayList.forEach(holiday => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);

      // Normalize both dates to midnight
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      for (
        let d = new Date(start);
        d.getTime() <= end.getTime();
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      ) {
        holidayDatesSet.add(d.toISOString().split('T')[0]); // e.g. "2025-01-01"
      }
    });

    const policyEffective = () => {
      if (!weekOffPolicy?.effectiveDate) return false;
      const effectiveDate = new Date(weekOffPolicy.effectiveDate);
      return effectiveDate >= new Date(year, 0, 1); // assumes policy applies for the year
    };

    let totalHours = 0;

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isoDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const dayName = date.toLocaleString('en-US', { weekday: 'long' }); // e.g. "Tuesday"
      const weekIndex = Math.floor((i - 1) / 7);
      const weekLabel = weekMap[weekIndex] || 'Fifth';

      if (holidayDatesSet.has(isoDate)) {
        continue;
      }

      let dailyHours = 0;

      if (policyEffective()) {
        const rules = dayRules[dayName];

        if (rules) {
          if (rules.includes('WeekOff')) {
            if (rules.length > 1) {
              // Conditional week-off like "First", "Third"
              if (rules.includes(weekLabel)) {
                dailyHours = 0;
              } else {
                dailyHours = 8;
              }
            } else {
              dailyHours = 0;
            }
          } else if (rules.includes('Halfday')) {
            dailyHours = 6;
          } else if (rules.includes('FullDay')) {
            dailyHours = 8;
          }
        } else {
          dailyHours = 8;
        }
      } else {
        // Fallback: weekends off
        const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
        dailyHours = isWeekend ? 0 : 8;
      }

      totalHours += dailyHours;

    }
    setTotalOfficialHours(totalHours);
  };

  const calculateMonthlyLogHours = (data) => {
    const logSummary = {};

    data.forEach(({ userId, date, records }) => {
      if (!logSummary[userId]) {
        logSummary[userId] = {
          daily: {},
          monthlyTotalSeconds: 0
        };
      }

      let totalLogSeconds = 0;

      const times = records.map(r => new Date(r.time)).sort((a, b) => a - b);

      if (times.length % 2 !== 0) {
        const lastTimeIn = times[times.length - 1];
        const tempTimeOut = new Date(lastTimeIn);
        tempTimeOut.setHours(19, 0, 0, 0);
        if (lastTimeIn.getHours() < 19) {
          times.push(tempTimeOut);
        }
      }

      for (let i = 0; i < times.length - 1; i += 2) {
        const timeIn = times[i];
        const timeOut = times[i + 1];
        const durationInSeconds = (timeOut - timeIn) / 1000;
        totalLogSeconds += durationInSeconds;
      }

      // Store daily log time
      const hours = Math.floor(totalLogSeconds / 3600);
      const minutes = Math.floor((totalLogSeconds % 3600) / 60);
      const seconds = Math.floor(totalLogSeconds % 60);

      const formattedLogTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      logSummary[userId].daily[date] = formattedLogTime;
      logSummary[userId].monthlyTotalSeconds += totalLogSeconds;
    });

    // Convert total monthly seconds to HH:MM:SS for each user
    for (const userId in logSummary) {
      const totalSeconds = logSummary[userId].monthlyTotalSeconds;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      logSummary[userId].monthlyTotal = `${hours
        .toString()
        .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;

      // Remove raw seconds if not needed
      delete logSummary[userId].monthlyTotalSeconds;
    }

    return logSummary;
  };


  const columns = [
    { Header: 'User Name', accessor: 'full_name', sortable: true },
    ...monthDays.map(({ day, dayOfWeek }) => ({
      Header: (
        <>
          {`${day}-${new Date(0, parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long' })}`} <br />
          {dayOfWeek}
        </>
      ),
      accessor: `${day}_${selectedMonth}_${selectedYear}`,
      sortable: true,
    })),
    { Header: 'Official Hours', accessor: 'officialHours', sortable: true },
    { Header: 'Working Hours', accessor: 'workingHours', sortable: true },
    { Header: 'Pending Hours', accessor: 'pendingHours', sortable: true },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Present':
        return 'text-present';
      case 'Absent':
        return 'text-absent';
      case 'WeekOff':
        return 'text-weekoff';
      case 'Halfday':
        return 'text-halfday';
      case 'Present on WeekOff':
        return 'text-present-on-weekoff';
      case 'Present on Holiday':
        return 'text-present-on-holiday';
      case 'Holiday':
        return 'text-holiday';
      case 'Leave':
        return 'text-leave';
      case 'Present on Leave':
        return 'text-present-on-leave';
      case 'Halfday on Full Leave':
        return 'text-halfday-on-full-leave';
      case 'Absent on Halfday Leave':
        return 'text-absent-on-halfday-leave';
      case 'Halfday Leave':
        return 'text-halfday-leave';
    }
  };

  // Utility function to convert total hours into hh:mm:ss format
  const formatTime = (totalHours) => {
    // Convert decimal hours to total seconds
    const totalSeconds = totalHours * 3600;

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Format as hh:mm:ss
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    setProcessedAttendanceData({}); // Clear old data
    setTotalOfficialHours(0); // Reset official hours

    dispatch(fetchAttendanceReportData(token, selectedMonth, selectedYear));
    dispatch(fetchUserData(token));
    dispatch(fetchWeekOffData(token));
    dispatch(fetchHolidayData(token, selectedMonth, selectedYear));
    dispatch(fetchLeaveData(token, selectedMonth, selectedYear));
    generateMonthDays(parseInt(selectedMonth));
    if (selectedMonth || selectedYear) {
      calculateTotalOfficialWorkingHours();
    }
  }, [token, selectedMonth, selectedYear, dispatch, generateMonthDays]);

  useEffect(() => {
    if (attendanceReportData?.data?.length &&
      weekOffData?.data &&
      holidayData !== undefined) {
      const logHoursByUserAndDate = calculateMonthlyLogHours(attendanceReportData.data);
      setProcessedAttendanceData(logHoursByUserAndDate);
    }
  }, [weekOffData, holidayData, attendanceReportData]);

  const subtractTimes = (t1, t2) => {
    const [h1, m1, s1] = t1.split(':').map(Number);
    const [h2, m2, s2] = t2.split(':').map(Number);

    let total1 = h1 * 3600 + m1 * 60 + s1;
    let total2 = h2 * 3600 + m2 * 60 + s2;

    let diff = Math.max(0, total1 - total2); // avoid negative

    const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const holidayDatesSet = new Set();

  holidayData?.data?.forEach(holiday => {
    // Parse the start and end dates as local dates.
    if (holiday.endDate === null) {
      holiday.endDate = holiday.startDate
    }

    const start = new Date(holiday.startDate);
    const end = new Date(holiday.endDate);

    // Manually adjust the time to 00:00:00 for both start and end to set the dates to midnight in local time.
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let currentDate = new Date(start);
    while (currentDate <= end) {
      const isoDate = currentDate.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format
      holidayDatesSet.add(isoDate);

      // Increment the currentDate by 1 day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  const weekOffDatesSet = new Set();

  function getWeekdayOccurrenceInMonth(date) {
    const targetDay = date.getDay(); // 0 (Sun) to 6 (Sat)
    let count = 0;
    for (let d = 1; d <= date.getDate(); d++) {
      const loopDate = new Date(date.getFullYear(), date.getMonth(), d);
      if (loopDate.getDay() === targetDay) {
        count++;
      }
    }
    return count;
  }

  if (weekOffData?.data?.length > 0) {
    const config = weekOffData?.data[0];
    const effectiveDate = new Date(config.effectiveDate);

    // Loop over the current month's days
    monthDays.forEach(({ day, dayOfWeek }, index) => {
      const formattedDay = day.padStart(2, '0');
      const date = new Date(`${selectedYear}-${selectedMonth.padStart(2, '0')}-${formattedDay}`);
      date.setHours(0, 0, 0, 0);

      if (date > effectiveDate) return; // Skip if beyond effective date

      const weekOffRule = config.days?.[dayOfWeek];

      if (!weekOffRule) return;

      const dateKey = date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

      if (weekOffRule.includes('WeekOff')) {
        const weekdayOccurrence = getWeekdayOccurrenceInMonth(date);

        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

        // If no ordinal, treat as full WeekOff (e.g., ['WeekOff'])
        if (!weekOffRule.some(r => ordinals.includes(r))) {
          weekOffDatesSet.add(dateKey);
        } else {
          // If any matching ordinal applies
          const matchesOrdinal = ordinals.some(ord => {
            return weekOffRule.includes(ord) && ordinalMatchIndex(ord) === weekdayOccurrence;
          });

          if (matchesOrdinal) {
            weekOffDatesSet.add(dateKey);
          }
        }
      }
    });
  }

  // Utility to convert 'First', 'Second', etc. to index
  function ordinalMatchIndex(ordinal) {
    const map = { First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5 };
    return map[ordinal] || -1;
  }

  function timeStringToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return (
    <Layout>
      <section className="section">
        <div className="row mb-3">
          <div className="col-lg-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignContent: 'center' }}>
              <h3 className='mb-0'>Attendance Monthly Report</h3>
              <h5 className='mb-0'>
                {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })}-{selectedYear}
              </h5>
              <div className='mt-0'>
                <button
                  type="button"
                  className="btn bgnone mx-1 mt-0"
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <select id="month-select" className="btn bgnone m-0 p-0" style={{ color: '#338db5' }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    {[...Array(12).keys()].map((i) => (
                      <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </button>
                <button
                  type="button"
                  className="btn bgnone mx-0 mt-0"
                  style={{ color: '#338db5', border: '1px solid #338db5' }}
                >
                  <select id="year-select" className="btn bgnone m-0 p-0" style={{ color: '#338db5' }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {[...Array(11).keys()].map((i) => {
                      const year = new Date().getFullYear() - (5 - i); // Generate the last 10 years
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='row mb-2'>
          <div className='col-lg-12 d-flex' style={{ overflowX: 'scroll' }}>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #4CAF50' }}>
              <span className={'text-present'}>P --- Present </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #F44336' }}>
              <span className={'text-absent'}>A --- Absent </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #9C27B0' }}>
              <span className={'text-halfday'}>HD --- Halfday </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #9E9E9E' }}>
              <span className={'text-weekoff'}>W --- WeekOff </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #FF9800' }}>
              <span className={'text-holiday'}>H --- Holiday </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #FF5722' }}>
              <span className={'text-leave'}>L --- Leave </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #2196F3' }}>
              <span className={'text-present-on-weekoff'}>POW --- Present on WeekOff </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #1976D2' }}>
              <span className={'text-present-on-holiday'}>POH --- Present on Holiday </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #1565C0' }}>
              <span className={'text-present-on-leave'}>POL --- Present on Leave </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #009688' }}>
              <span className={'text-halfday-on-full-leave'}>HOFL --- Halfday on Full Leave </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #DC143C' }}>
              <span className={'text-absent-on-halfday-leave'}>AOHL --- Absent on Halfday Leave </span>
            </div>
            <div className={`btn bgnone mx-1 mt-0 fitContent`} style={{ border: '1px solid #DAA520' }}>
              <span className={'text-halfday-leave'}>HL --- Halfday Leave </span>
            </div>
          </div>
        </div>

        {monthDays.length > 0 && userData.data?.length > 0 &&
          <div className='row'>
            <div className="col-lg-12">
              <div className="datatable-wrapper px-0" style={{ borderRadius: '0px' }}>
                <table className="datatableReport px-0 mx-0">
                  <thead>
                    <tr style={{ backgroundColor: '#c1dde9' }}>
                      {columns.map((column) => (
                        <th key={column.accessor} style={{ border: '1px solid black' }}>
                          {column.Header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userData.data.map((user) => {
                      const userAttendance = processedAttendanceData[user.id];

                      // Filter leave data once per user
                      const userLeaves = leaveData?.data?.filter(
                        (leave) => leave.empCode === user.empCode && leave.status === 'Approved'
                      );

                      return (
                        <tr key={user.id}>
                          <td style={{ border: '1px solid black' }}>
                            <strong>{user.full_name}</strong>
                          </td>

                          {monthDays.map(({ day, dayOfWeek }) => {
                            const formattedDay = day.padStart(2, '0');
                            const fullDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${formattedDay}`;
                            const dateKey = fullDate;

                            const timeStr = userAttendance?.daily?.[fullDate]; // e.g. "08:15:00"
                            const isHoliday = holidayDatesSet.has(dateKey);
                            const isWeekOff = weekOffDatesSet.has(dateKey);

                            // Leave Logic
                            let leaveStatus = null;
                            for (const leave of userLeaves || []) {
                              const leaveStart = new Date(leave.startDate);
                              const leaveEnd = new Date(leave.endDate || leave.startDate);
                              const currentDate = new Date(fullDate);

                              leaveStart.setHours(0, 0, 0, 0);
                              leaveEnd.setHours(0, 0, 0, 0);
                              currentDate.setHours(0, 0, 0, 0);

                              if (currentDate >= leaveStart && currentDate <= leaveEnd) {
                                // console.log((leave.endDay === "First Half" || leave.endDay === "Second Half"));

                                const isStart = leave.startDate === fullDate;
                                const isEnd = leave.endDate === fullDate;

                                const isStartHalf = leave.startDay === 'First Half' || leave.startDay === 'Second Half';
                                const isEndHalf = leave.endDay === 'First Half' || leave.endDay === 'Second Half';

                                if ((isStart && isStartHalf) || (isEnd && isEndHalf)) {
                                  leaveStatus = 'Halfday Leave';
                                } else {
                                  leaveStatus = 'Leave';
                                }

                                break;
                              }
                            }

                            // ✅ Status Calculation
                            let status = '';

                            if (timeStr) {
                              const [hh, mm, ss] = timeStr.split(':').map(Number);
                              const totalHours = hh + mm / 60 + ss / 3600;

                              if (leaveStatus === 'Leave' && totalHours > 6) {
                                status = 'Present on Leave';
                              } else if (leaveStatus === 'Leave' && totalHours < 6) {
                                status = 'Halfday on Full Leave';
                              } else if (leaveStatus === 'Halfday Leave' && totalHours <= 6) {
                                status = 'Halfday Leave';
                              } else if (isHoliday) {
                                status = totalHours > 0 ? 'Present on Holiday' : 'Holiday';
                              } else if (isWeekOff) {
                                status = totalHours > 0 ? 'Present on WeekOff' : 'WeekOff';
                              } else if (totalHours > 6) {
                                status = 'Present';
                              } else if (totalHours > 0) {
                                status = 'Halfday';
                              } else {
                                status = 'Absent';
                              }
                            } else {
                              if (leaveStatus === 'Leave') {
                                status = 'Leave';
                              } else if (leaveStatus === 'Halfday Leave') {
                                status = 'Absent on Halfday Leave';
                              } else if (isHoliday) {
                                status = 'Holiday';
                              } else if (isWeekOff) {
                                status = 'WeekOff';
                              } else {
                                status = 'Absent';
                              }
                            }

                            return (
                              <td
                                key={fullDate}
                                style={{ border: '1px solid black' }}
                                className={getStatusClass(status)}
                                title={status}
                              >
                                {`${status === 'Present' ? 'P'
                                  : status === 'Absent' ? 'A'
                                    : status === 'Present on WeekOff' ? 'POW'
                                      : status === 'Present on Holiday' ? 'POH'
                                        : status === 'Present on Leave' ? 'POL'
                                          : status === 'Holiday' ? 'H'
                                            : status === 'Halfday' ? 'HD'
                                              : status === 'WeekOff' ? 'W'
                                                : status === 'Leave' ? 'L'
                                                  : status === 'Halfday on Full Leave' ? 'HOFL'
                                                    : status === 'Absent on Halfday Leave' ? 'AOHL'
                                                      : status === 'Halfday Leave' ? 'HL'
                                                        : status
                                  }`}
                                <br />
                                {timeStr ? <>{timeStr}</> : '00:00:00'}
                                {(leaveStatus === 'Leave' || leaveStatus === 'Halfday Leave') && userLeaves?.[0]?.LeaveType?.name && (
                                  <>
                                    <br />
                                    <span
                                      onClick={() => {
                                        const leave = userLeaves?.find((leave) => {
                                          const leaveStart = new Date(leave.startDate);
                                          const leaveEnd = new Date(leave.endDate || leave.startDate);
                                          const currentDate = new Date(fullDate);

                                          leaveStart.setHours(0, 0, 0, 0);
                                          leaveEnd.setHours(0, 0, 0, 0);
                                          currentDate.setHours(0, 0, 0, 0);

                                          return currentDate >= leaveStart && currentDate <= leaveEnd;
                                        });

                                        if (leave) {
                                          const leaveType = leave.LeaveType?.name || 'N/A';
                                          const userName = user.full_name || 'N/A';
                                          const leaveDate = fullDate;

                                          setBodyContent(
                                            <div>
                                              <p><strong>User:</strong> {userName}</p>
                                              <p><strong>Date:</strong> {leaveDate}</p>
                                              <p><strong>Leave Type:</strong> {leaveType}</p>
                                            </div>
                                          );
                                          setShowModal(true);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      Leave
                                    </span>
                                  </>
                                )}
                              </td>
                            );
                          })}

                          <td style={{ border: '1px solid black', color: '#338DB5' }}>
                            {formatTime(totalOfficialHours)}
                          </td>

                          <td style={{
                            border: '1px solid black',
                            color: (timeStringToSeconds(userAttendance?.monthlyTotal || '00:00:00') >= timeStringToSeconds(formatTime(totalOfficialHours)))
                              ? 'green' : 'red'
                          }}>
                            {userAttendance ? userAttendance.monthlyTotal : '00:00:00'}
                          </td>

                          <td style={{
                            border: '1px solid black',
                            color: (
                              timeStringToSeconds(userAttendance
                                ? subtractTimes(formatTime(totalOfficialHours), userAttendance.monthlyTotal)
                                : formatTime(totalOfficialHours)
                              ) <= 0
                            ) ? 'green' : 'red'
                          }}>
                            {userAttendance
                              ? subtractTimes(formatTime(totalOfficialHours), userAttendance.monthlyTotal)
                              : formatTime(totalOfficialHours)
                            }
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </section>
      <ModalComponent
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Leave Details"
        bodyContent={bodyContent}
        size='sm'
      />
    </Layout>
  );
}

export default AttendanceReport;