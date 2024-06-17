import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import LTpic from '../assets/About/LT_P.jpg';
import Epic from '../assets/About/E_P.jpg';
import Ghpic from '../assets/About/Gh_P.jpg';
import TNpic from '../assets/About/TN_P.jpg';
import styles from '../assets/styles/Screens/Public/AboutUsScreen.module.css';

const AboutUsScreen = () => {
  const royalKota =
    'https://res.cloudinary.com/duwfiikgg/image/upload/v1713152952/BONCHAIEATS/aihff3ccv3sfxc1g6jyl.jpg';

  return (
    <Container>
      <div className={styles.backgroundContainer}>
        <h1 className={styles.mainHeaderText}>Our Story</h1>
        <p className={styles.mainCenterText}>
          We not only connect consumers with diverse culinary experiences, but
          through innovation and knowledge, we empower our local restaurants to
          be at the forefront of technology and create employment opportunities
          to build a brighter future.
        </p>
      </div>

      <Row className={`align-items-center ${styles.mb5} ${styles['mb-md-5']}`}>
        <Col md={6}>
          <Image
            src={royalKota}
            alt='royalKota'
            fluid
            className={styles.smallImage}
          />
        </Col>
        <Col md={6}>
          <div>
            <h1 className={`${styles.headerText}`}>
              The beginning of our experiment
            </h1>
            <span className={styles.hashtagSpan}>#BON_CHAI_EATS</span>
            <p className={styles.centerText}>
              We started with only one product from Bon Chai Eats and offered it
              to consumers in Royal Cradle. This product helped us gain insights
              into our customer needs and restaurant dynamics to better
              understand how to forge the local connection between restaurant
              and consumer.
            </p>
          </div>
        </Col>
      </Row>

      <Row className={`align-items-center ${styles.mb5} ${styles['mb-md-5']}`}>
        <Col md={{ span: 6, order: 2 }}>
          <Image
            src={Ghpic}
            alt='Gerhand Visser'
            fluid
            className={styles.smallImage}
          />
        </Col>
        <Col md={{ span: 6, order: 1 }}>
          <div>
            <h1 className={`${styles.headerText}`}>Analysis</h1>
            <span className={styles.hashtagSpan}>#SUGARBERRY</span>
            <p className={styles.centerText}>
              Through experimentation and understanding of the local food
              business spectrum, we found a way to tell each restaurant's story
              and embraced the uniqueness every restaurant provided. We ensured
              that the local connection bond was not severed but strengthened.
            </p>
          </div>
        </Col>
      </Row>

      <Row className={`align-items-center ${styles.mb5} ${styles['mb-md-5']}`}>
        <Col md={6}>
          <Image src={LTpic} alt='Food' fluid className={styles.smallImage} />
        </Col>
        <Col md={6}>
          <div>
            <h1 className={`${styles.headerText}`}>Growth</h1>
            <span className={styles.hashtagSpan}>#LUCY</span>
            <p className={styles.centerText}>
              Our growth has been driven by a deep understanding of local food
              businesses. We celebrate the unique stories each restaurant
              offers, reinforcing the local bond and fostering a stronger
              community connection.
            </p>
          </div>
        </Col>
      </Row>

      <div>
        <h1 className={`${styles.subHeaderText}`}>
          We envision a future where our food platform serves as a catalyst for
          socioeconomic growth.
        </h1>
      </div>

      <Row className={`align-items-center ${styles.mb5} ${styles['mb-md-5']}`}>
        <Col md={{ span: 6, order: 2 }}>
          <Image src={Epic} alt='Emily' fluid className={styles.smallImage} />
        </Col>
        <Col md={{ span: 6, order: 1 }}>
          <div>
            <h1 className={`${styles.headerText}`}>Conclusion</h1>
            <span className={styles.hashtagSpan}>#SUGARBERRY</span>
            <p className={styles.centerText}>
              With every meal prepared, we contribute to the growth of local
              businesses, create employment opportunities, and support
              sustainable economic development.
            </p>
          </div>
        </Col>
      </Row>

      <Row className={`align-items-center ${styles.mb5} ${styles['mb-md-5']}`}>
        <Col md={6}>
          <Image src={TNpic} alt='Team' fluid className={styles.smallImage} />
        </Col>
        <Col md={6}>
          <div>
            <h1 className={`${styles.headerText}`}>Man of Science at Work</h1>
            <span className={styles.hashtagSpan}>#FOUNDER</span>
            <p className={styles.centerText}>
              "My desire is to leverage my ingenuity and insight to drive
              meaningful change within my community, empowering individuals and
              businesses to thrive independently and contribute to a sustainable
              and equitable future."
            </p>
          </div>
        </Col>
      </Row>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <span className={styles.hashtagSpan}>
          #COMMUNITY #INNOVATION #EMPOWERMENT #DIVERSITY #INCLUSION #VISION
          #FOODIE #FOOD #COLLABORATION #GROWTH #JOZI #AFRICA
        </span>
      </div>
    </Container>
  );
};

export default AboutUsScreen;
