import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div>
            <Header />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 p-0">
                        <Sidebar />
                    </div>
                    <div className="col-md-10">
                        <main className="p-3">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;