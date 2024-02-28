import React from 'react'
import { useNavigate } from 'react-router-dom'
import { NavLink, Outlet } from 'react-router-dom'

function Nav() {

    const navigate = useNavigate();

    return (
        <div className='container'>
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="collapse navbar-collapse" style={{ justifyContent: 'center' }}>
                    <div className="navbar-nav">
                        <NavLink className="nav-link navbar-nav" to="/">Entry logs</NavLink>
                        <NavLink className="nav-link navbar-nav" to="/register">Register</NavLink>
                    </div>
                </div>
            </nav>

            <Outlet />
        </div>
    )
}

export default Nav