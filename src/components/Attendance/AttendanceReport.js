import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AttendanceReport = () => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let url = `/attendance/report?startDate=${startDate}&endDate=${endDate}`;
            if (user?.Role === 'Employee') {
                url += `&employeeId=${user.EmployeeID}`;
            }
            const response = await api.get(url);
            setAttendance(response.data.data);
            calculateSummary(response.data.data);
        } catch (error) {
            alert('Failed to fetch attendance report');
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data) => {
        const totalDays = data.length;
        const present = data.filter(a => a.Status === 'Present').length;
        const late = data.filter(a => a.Status === 'Late').length;
        const absent = data.filter(a => !a.CheckInTime).length;
        const totalHours = data.reduce((sum, a) => sum + (parseFloat(a.TotalHours) || 0), 0);
        
        setSummary({
            totalDays,
            present,
            late,
            absent,
            totalHours: totalHours.toFixed(2),
            attendancePercentage: totalDays > 0 ? ((present / totalDays) * 100).toFixed(2) : 0
        });
    };

    const exportToCSV = () => {
        const headers = ['Employee Code', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Status'];
        const csvData = attendance.map(att => [
            att.EmployeeCode,
            `${att.FirstName} ${att.LastName}`,
            new Date(att.AttendanceDate).toLocaleDateString(),
            att.CheckInTime || '-',
            att.CheckOutTime || '-',
            att.TotalHours || '-',
            att.Status || 'Absent'
        ]);
        
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Attendance Report</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container mt-4">
                        <h2>Attendance Report</h2>
                        <p>Period: ${startDate} to ${endDate}</p>
                        ${summary ? `
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Total Days</h6>
                                            <h3>${summary.totalDays}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card bg-success text-white">
                                        <div class="card-body">
                                            <h6>Present</h6>
                                            <h3>${summary.present}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card bg-danger text-white">
                                        <div class="card-body">
                                            <h6>Absent</h6>
                                            <h3>${summary.absent}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card bg-info text-white">
                                        <div class="card-body">
                                            <h6>Attendance %</h6>
                                            <h3>${summary.attendancePercentage}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${attendance.map(att => `
                                    <tr>
                                        <td>${att.FirstName} ${att.LastName}</td>
                                        <td>${new Date(att.AttendanceDate).toLocaleDateString()}</td>
                                        <td>${att.CheckInTime || '-'}</td>
                                        <td>${att.CheckOutTime || '-'}</td>
                                        <td>${att.Status || 'Absent'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `);
        printWindow.print();
    };

    return (
        <div className="container mt-4">
            <h2>Attendance Report</h2>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                {loading ? 'Loading...' : 'Generate Report'}
                            </button>
                            {attendance.length > 0 && (
                                <>
                                    <button type="button" className="btn btn-success me-2" onClick={exportToCSV}>
                                        <i className="bi bi-download"></i> CSV
                                    </button>
                                    <button type="button" className="btn btn-info" onClick={printReport}>
                                        <i className="bi bi-printer"></i> Print
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {summary && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h6>Total Working Days</h6>
                                <h3>{summary.totalDays}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h6>Present Days</h6>
                                <h3>{summary.present}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-dark">
                            <div className="card-body">
                                <h6>Late Days</h6>
                                <h3>{summary.late}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h6>Attendance Percentage</h6>
                                <h3>{summary.attendancePercentage}%</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {attendance.length > 0 && (
                <div className="card shadow">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        {user?.Role !== 'Employee' && <th>Employee Code</th>}
                                        <th>Employee Name</th>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Total Hours</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((att, index) => (
                                        <tr key={index}>
                                            {user?.Role !== 'Employee' && <td>{att.EmployeeCode}</td>}
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;