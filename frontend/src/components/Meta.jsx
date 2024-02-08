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
  title: 'Welcome To 5-tyga food Market',
  description: 'We sell the best food proucts at R50',
  keywords: 'food, buy food, delicuous food, cheap food',
};

export default Meta;
