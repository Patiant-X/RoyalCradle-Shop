import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <div className="error-page d-flex justify-content-center align-items-center">
            <div className="text-center">
                <h2>404</h2>
                <h3>Oops! Page Not Found</h3>
                <p>Sorry, but the page you are looking for does not exist.</p>
                <div className="btn-box">
                    <Link to='/' className="btn btn-primary" data-text="Go To Home +">Go To Home +</Link>
                </div>
            </div>
        </div>
    );
};

export default Error;
