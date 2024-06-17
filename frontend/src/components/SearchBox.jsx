import React, { useState, forwardRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
//import './RoyalCradleBlog.css'; // Import the custom CSS file

const SearchBox = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();

  // FIX: uncontrolled input - urlKeyword may be undefined
  const [keyword, setKeyword] = useState(urlKeyword || '');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword) {
      navigate(`/search/${keyword.trim()}`);
      setKeyword('');
    } else {
      navigate('/');
    }
  };

  return (
    <Form onSubmit={submitHandler} className='d-flex'>
      <Form.Control
        type='text'
        name='q'
        ref={ref} // Attach the ref here
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Craving something?'
        className='mr-sm-2 ml-sm-5 search-box-input' // Add the custom class here
      ></Form.Control>
      <Button type='submit' className='p-2 mx-2'>
        Search
      </Button>
    </Form>
  );
});

export default SearchBox;
