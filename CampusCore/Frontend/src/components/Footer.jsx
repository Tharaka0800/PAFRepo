import React from 'react';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            background: 'var(--purple-main)', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>CC</div>
                        <h3 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.2rem' }}>CampusCore</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                        The comprehensive operations hub for modern smart campuses. 
                        Streamlining incident reporting, facility management, and resource allocation.
                    </p>
                </div>

                <div className="footer-links-group">
                    <div className="footer-links-column">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#">Incidents</a></li>
                            <li><a href="#">Facilities</a></li>
                            <li><a href="#">Bookings</a></li>
                            <li><a href="#">Alerts</a></li>
                        </ul>
                    </div>
                    <div className="footer-links-column">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Technical Info</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span>© 2026 CampusCore Operations. All rights reserved.</span>
                    <div className="system-badge">
                        <div className="status-dot"></div>
                        Systems Operational
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Version 1.2.0-stable</span>
                    <a href="#" style={{ color: 'var(--purple-main)', textDecoration: 'none', fontWeight: '600' }}>Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
