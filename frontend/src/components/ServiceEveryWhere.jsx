import React from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import {
  FaConciergeBell,
  FaHandHoldingUsd,
  FaWallet,
  FaShippingFast,
  FaHeadset,
} from 'react-icons/fa';

const ServiceFeatures = () => {
  return (
    <Container className='p-5'>
      <h1 className='text-center mb-4 fw-light'>#EveryWhere</h1>
      <Row className='align-items-center mt-3'>
        <Col xs={12} md={6} className='mb-4'>
          <Card className='p-3 border-0 shadow-sm'>
            <div className='feature d-flex align-items-center gap-3'>
              <FaConciergeBell className='icon' size={40} />
              <p className='mb-0'>Exclusive shopping assistance at any store.</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} className='mb-4'>
          <Card className='p-3 border-0 shadow-sm'>
            <div className='feature d-flex align-items-center gap-3'>
              <FaHeadset className='icon' size={40} />
              <p className='mb-0'>Receive full attention and premium support via our chat app.</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} className='mb-4'>
          <Card className='p-3 border-0 shadow-sm'>
            <div className='feature d-flex align-items-center gap-3'>
              <FaShippingFast className='icon' size={40} />
              <p className='mb-0'>Rapid and secure delivery within the hour*.</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} className='mb-4'>
          <Card className='p-3 border-0 shadow-sm'>
            <div className='feature d-flex align-items-center gap-3'>
              <FaHandHoldingUsd className='icon' size={40} />
              <p className='mb-0'>Transparent service fees for your convenience.</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} className='mb-4'>
          <Card className='p-3 border-0 shadow-sm'>
            <div className='feature d-flex align-items-center gap-3'>
              <FaWallet className='icon' size={40} />
              <p className='mb-0'>Flexible payment options: card, cash, or eWallet.</p>
            </div>
          </Card>
        </Col>
      </Row>
      <hr />
      <div className='pricing mt-4'>
        <h2 className='text-center mb-4'>Pricing Information</h2>
        <Card className='p-4 border-0 shadow-sm'>
          <Row>
            <Col xs={12} md={6}>
              <div className='base-charge'>
                <h5>Base Charge:</h5>
                <p className='mb-2'>R50</p>
                <ul className='mb-3'>
                  <li>Maximum of 3km</li>
                  <li>Up to 5 items</li>
                  <li>30 minutes of shopping</li>
                </ul>
                <p className='mb-2'><i>This base charge is not inclusive of additional services.</i></p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className='additional-charges'>
                <h5>Additional Charges:</h5>
                <ul>
                  <li>R10 per additional km</li>
                  <li>R5 for every additional item</li>
                  <li>R1 per additional minute</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Container>
  );
};

export default ServiceFeatures;
