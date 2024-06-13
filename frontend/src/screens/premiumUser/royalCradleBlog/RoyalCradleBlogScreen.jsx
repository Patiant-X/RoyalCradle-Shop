import React from 'react';
import { Container, Row, Col, Badge, Alert, Image } from 'react-bootstrap';
import './RoyalCradleBlog.css'; // Custom CSS file
import pic from './chess-piece.jpg'

const RoyalCradleBlogScreen = () => {
  const handlePremiumMessage = () => {
    alert("Content is only available to premium Royal-Cradle members.");
  };

  return (
    <Container className='lets'>
      <Row>
        <Col md={8} className="blog-content">
          <Image src={pic} fluid className="header-image" />
          <h1 className="blog-title">Victimized and Blamed: A Deeper Dive into Freedom and Parenting Failures</h1>
          <Badge variant="info" className="read-time">Read Time: 5 mins</Badge>
          <audio controls className="audio-content">
            <source src="path_to_audio.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <p className="introduction">
            Imagine being a victim of a crime and getting blamed for it. This is not just an isolated incident but a recurring theme that reflects deeper societal issues...
          </p>
          <Alert variant="info" onClose={handlePremiumMessage} dismissible>
            Content is only available to premium Royal-Cradle members.
          </Alert>
        </Col>
        <Col md={4} className="sidebar">
          {/* Sidebar content or advertisements */}
        </Col>
      </Row>
    </Container>
  );
};

export default RoyalCradleBlogScreen;
