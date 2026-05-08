import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="bg-light vh-100 p-3" style={{ width: '250px' }}>
            <ul className="nav nav-pills flex-column">
                <li className="nav-item mb-2">
                    <Link className="nav-link" to="/">
                        Dashboard
                    </Link>
                </li>
                <li className="nav-item mb-2">
                    <Link className="nav-link" to="/attendance">
                        Check In/Out
                    </Link>
                </li>
                {(user?.Role === 'Admin' || user?.Role === 'Manager') && (
                    <>
                        <li className="nav-item mb-2">
                            <Link className="nav-link" to="/employees">
                                Employees
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link className="nav-link" to="/add-employee">
                                Add Employee
                            </Link>
                        </li>
                    </>
                )}
                <li className="nav-item mb-2">
                    <Link className="nav-link" to="/reports">
                        Reports
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;