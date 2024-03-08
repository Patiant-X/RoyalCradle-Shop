import {
  MDBFooter,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBIcon,
} from 'mdb-react-ui-kit';

import { LinkContainer } from 'react-router-bootstrap';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaGem,
  FaHome,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import { Col, Container, Row } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='bg-primary text-center text-lg-start text-muted'>
      <section className='d-flex justify-content-center justify-content-lg-between p-4 border-bottom'>
        <div className='me-5 d-none d-lg-block'>
          <span>Get connected with us on social networks:</span>
        </div>

        <div>
          <a href='#' className='me-4 text-reset'>
            <FaInstagram size={35} />
          </a>
          <a href='#' className='me-4 text-reset'>
            <FaYoutube size={35} />
          </a>
          <a href='#' className='me-4 text-reset'>
            <FaTiktok size={35} />
          </a>
          <a href='#' className='me-4 text-reset'>
            <FaFacebook size={35} />
          </a>
        </div>
      </section>

      <section className=''>
        <Container className='text-center text-md-start mt-5'>
          <Row className='mt-3'>
            <Col md='3' lg='4' xl='3' className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>
                <FaGem className='me-3' />
                RC-Shop
              </h6>
              <p>Affordable eats, local connections..</p>
            </Col>

            <Col md='3' lg='3' xl='3' className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Legal</h6>
              <p>
                <a href='/terms-and-conditions' className='text-reset'>
                  Terms & Conditions
                </a>{' '}
                |
              </p>
              <p>
                <a href='/privacy-policy' className='text-reset'>
                  Privacy Policy
                </a>{' '}
                |
              </p>
              <p>
                <a href='https://www.yoco.com/za/' className='text-reset' target='_blank'>
                  Powered by Yoco
                </a>
              </p>
            </Col>

            {/* <Col md='3' lg='2' xl='2' className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Useful links</h6>
              <p>
                <a href='#!' className='text-reset'>
                  Pricing
                </a>
              </p>
              <p>
                <a href='#!' className='text-reset'>
                  Settings
                </a>
              </p>
              <p>
                <a href='#!' className='text-reset'>
                  Orders
                </a>
              </p>
              <p>
                <a href='#!' className='text-reset'>
                  Help
                </a>
              </p>
            </Col> */}

            <Col md='4' lg='4' xl='3' className='mx-auto mb-md-0 mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Contact</h6>
              <p>
                <FaHome className='me-3' />
                RoyalCradle
              </p>
              <p>
                <a
                  href='mailto:5tygaeats@gmail.com'
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <FaEnvelope className='me-3' /> 5tygaeats@gmail.com
                </a>
              </p>
              <p>
                <FaPhone className='me-3' /> +27 65 892 8881
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <div
        className='text-center p-4'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
      >
        © {new Date().getFullYear()} RoyalCradle-Shop{'  '}
        <a className='text-reset fw-bold' href='https://grandkids.vercel.app/' style={{ textDecoration: 'none'}}>
          Designed By Grandkids
        </a>
      </div>
    </footer>
  );
};
export default Footer;
