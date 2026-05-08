import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <i className="bi bi-calendar-check"></i> Attendance System
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                                <i className="bi bi-person-circle"></i> {user?.FirstName} {user?.LastName}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <span className="dropdown-item-text">
                                        <small>
                                            <strong>Role:</strong> {user?.Role}<br />
                                            <strong>Employee Code:</strong> {user?.EmployeeCode}<br />
                                            <strong>Department:</strong> {user?.Department}
                                        </small>
                                    </span>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;