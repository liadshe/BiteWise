import logoImg from '../assets/logo.png';

function Sidebar() {
    return (
        <div className="d-flex flex-column p-3 bg-white border-end" style={{ width: '280px', height: '100vh', position: 'sticky', top: 0 }}>
            {/* logo */}
            <a href="/" className="d-flex align-items-center mb-4 text-decoration-none">
              <img src={logoImg} alt="BiteWise Logo" width="40" className="me-2" />
                <span className="fs-4 fw-bold" style={{ color: '#e81e61' }}>BiteWise</span>
            </a>

            {/* navigation links */}
            <ul className="nav nav-pills flex-column mb-auto gap-2">
                <li className="nav-item">
                    <a href="#" className="nav-link active d-flex align-items-center" style={{ backgroundColor: '#e81e61', borderRadius: '12px' }}>
                        <i className="bi bi-house-door me-3"></i> Home
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                        <i className="bi bi-plus-circle me-3"></i> Create Recipe
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                        <i className="bi bi-person me-3"></i> My Profile
                    </a>
                </li>
            </ul>

            {/* user profile */}
            <div className="mt-auto border-top pt-3">
                <div className="d-flex align-items-center p-2 mb-2 rounded" style={{ backgroundColor: '#fcf0f4' }}>
                    <img src="https://ui-avatars.com/api/?name=David+Levi&background=random" alt="David" width="40" height="40" className="rounded-circle me-2" />
                    <div>
                        <h6 className="mb-0 fw-bold">David Levi</h6>
                        <small className="text-muted">@davidl</small>
                    </div>
                </div>
                <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;