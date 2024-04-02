import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'Welcome To 5TygaEats food Market',
  description: 'Enjoy the convenience of delicious meals delivered right to your doorstep!',
  keywords: 'food, buy food, delicuous food, cheap food',
};

export default Meta;
