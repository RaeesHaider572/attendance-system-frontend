import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        onLeave: 0
    });
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            const [employeesRes, attendanceRes, todayAttendanceRes] = await Promise.all([
                api.get('/employees'),
                api.get(`/attendance/report?startDate=${lastWeek}&endDate=${today}`),
                api.get(`/attendance/today/${user?.EmployeeID}`)
            ]);

            const attendance = attendanceRes.data.data || [];
            const todayAttendances = attendance.filter(a => a.AttendanceDate === today);
            
            setStats({
                totalEmployees: employeesRes.data.data?.length || 0,
                presentToday: todayAttendances.filter(a => a.Status === 'Present').length,
                absentToday: todayAttendances.filter(a => !a.CheckInTime).length,
                lateToday: todayAttendances.filter(a => a.Status === 'Late').length,
                onLeave: 0
            });
            
            setRecentAttendance(attendance.slice(0, 10));
            setTodayAttendance(todayAttendanceRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-gradient-primary text-white">
                        <div className="card-body">
                            <h3>{getGreeting()}, {user?.FirstName} {user?.LastName}!</h3>
                            <p className="mb-0">Welcome to your attendance dashboard. Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            {todayAttendance && !todayAttendance.CheckOutTime && todayAttendance.CheckInTime && (
                                <div className="mt-2">
                                    <span className="badge bg-warning text-dark">You have checked in at {todayAttendance.CheckInTime}</span>
                                </div>
                            )}
                            {todayAttendance && todayAttendance.CheckOutTime && (
                                <div className="mt-2">
                                    <span className="badge bg-success">Completed today's attendance</span>
                                </div>
                            )}
                            {!todayAttendance && (
                                <div className="mt-2">
                                    <span className="badge bg-danger">Not checked in yet today</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Employees</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalEmployees}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-people fs-1 text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Present Today</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.presentToday}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-check-circle fs-1 text-success"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Late Arrivals</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.lateToday}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-clock-history fs-1 text-warning"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-left-danger shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">Absent Today</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.absentToday}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-x-circle fs-1 text-danger"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Recent Attendance Activity (Last 7 Days)</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Date</th>
                                            <th>Check In</th>
                                            <th>Check Out</th>
                                            <th>Total Hours</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAttendance.map((att, index) => (
                                            <tr key={index}>
                                                <td>{att.FirstName} {att.LastName}</td>
                                                <td>{new Date(att.AttendanceDate).toLocaleDateString()}</td>
                                                <td>{att.CheckInTime || '-'}</td>
                                                <td>{att.CheckOutTime || '-'}</td>
                                                <td>{att.TotalHours || '-'}</td>
                                                <td>
                                                    <span className={`badge bg-${att.Status === 'Present' ? 'success' : att.Status === 'Late' ? 'warning' : 'danger'}`}>
                                                        {att.Status || 'Absent'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {recentAttendance.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center">No attendance records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Today's Status</h6>
                        </div>
                        <div className="card-body">
                            {todayAttendance ? (
                                <div>
                                    <div className="mb-3">
                                        <label className="text-muted">Check In Time:</label>
                                        <h5>{todayAttendance.CheckInTime || 'Not checked in'}</h5>
                                    </div>
                                    {todayAttendance.CheckOutTime && (
                                        <div className="mb-3">
                                            <label className="text-muted">Check Out Time:</label>
                                            <h5>{todayAttendance.CheckOutTime}</h5>
                                        </div>
                                    )}
                                    {todayAttendance.TotalHours && (
                                        <div className="mb-3">
                                            <label className="text-muted">Total Hours:</label>
                                            <h5>{todayAttendance.TotalHours} hours</h5>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="text-muted">Status:</label>
                                        <h5>
                                            <span className={`badge bg-${todayAttendance.Status === 'Present' ? 'success' : 'warning'}`}>
                                                {todayAttendance.Status || 'Present'}
                                            </span>
                                        </h5>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-clock fs-1 text-muted"></i>
                                    <p className="mt-2">No attendance recorded for today</p>
                                    <a href="/attendance" className="btn btn-primary btn-sm">Check In Now</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <a href="/attendance" className="btn btn-success">
                                    <i className="bi bi-clock"></i> Check In/Out
                                </a>
                                <a href="/reports" className="btn btn-info">
                                    <i className="bi bi-graph-up"></i> View Reports
                                </a>
                                {user?.Role !== 'Employee' && (
                                    <a href="/employees" className="btn btn-primary">
                                        <i className="bi bi-people"></i> Manage Employees
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;