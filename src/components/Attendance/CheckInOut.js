import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CheckInOut = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        checkTodayStatus();
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    const checkTodayStatus = async () => {
        try {
            const response = await api.get(`/attendance/today/${user?.EmployeeID}`);
            setAttendance(response.data.data);
        } catch (error) {
            console.error('Error checking attendance:', error);
        }
    };

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/checkin', { employeeId: user.EmployeeID });
            await checkTodayStatus();
            alert('✅ Check-in successful!');
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/checkout', { employeeId: user.EmployeeID });
            await checkTodayStatus();
            alert('✅ Check-out successful!');
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h4>Attendance System</h4>
                        </div>
                        <div className="card-body text-center">
                            <div className="mb-4">
                                <h5>Welcome, {user?.FirstName} {user?.LastName}</h5>
                                <p className="text-muted">{user?.Department} - {user?.Designation}</p>
                            </div>
                            
                            <div className="mb-4">
                                <div className="display-6 mb-2">
                                    {currentTime.toLocaleTimeString()}
                                </div>
                                <div className="text-muted">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {!attendance ? (
                                <div>
                                    <p className="text-muted mb-3">You haven't checked in today</p>
                                    <button 
                                        className="btn btn-success btn-lg px-5"
                                        onClick={handleCheckIn}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                        )}
                                        Check In
                                    </button>
                                </div>
                            ) : !attendance.CheckOutTime ? (
                                <div>
                                    <div className="alert alert-info">
                                        <strong>Checked In at:</strong> {attendance.CheckInTime}
                                        <br />
                                        <strong>Status:</strong> {attendance.Status}
                                    </div>
                                    <button 
                                        className="btn btn-danger btn-lg px-5"
                                        onClick={handleCheckOut}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                        )}
                                        Check Out
                                    </button>
                                </div>
                            ) : (
                                <div className="alert alert-success">
                                    <h5>Today's Attendance Summary</h5>
                                    <hr />
                                    <p><strong>Check In:</strong> {attendance.CheckInTime}</p>
                                    <p><strong>Check Out:</strong> {attendance.CheckOutTime}</p>
                                    <p><strong>Total Hours:</strong> {attendance.TotalHours} hours</p>
                                    <p><strong>Status:</strong> {attendance.Status}</p>
                                    <i className="bi bi-check-circle-fill"></i> You have completed today's attendance
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckInOut;