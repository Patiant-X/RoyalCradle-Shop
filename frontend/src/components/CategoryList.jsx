// CategoryList.js
import React from 'react';
import { Card } from 'react-bootstrap';

const CategoryList = ({ categories, onSelectCategory, selectedCategory }) => {
  const all = {
    name: "ALL",
    icon: '', // Replace <YourFreeIconComponentHere /> with your icon component
  };
  return (
    <>
      {' '}
      <div className='overflow-hidden'>
        <div
          className='d-flex flex-nowrap overflow-auto'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[all, ...categories].map((category, index) => (
            <Card
              key={index}
              className={`border-0 mr-3 shadow-none `}
              style={{ width: '7rem', minWidth: '7rem' }}
            >
              <Card.Body
                className='d-flex flex-column align-items-center justify-content-center'
                onClick={() => onSelectCategory(category.name === "ALL" ? '' : category.name)}
                style={{ cursor: 'pointer', height: '7rem' }} // Set a fixed height for the Card.Body
              >
                <div style={{ flex: 1 }}>
                  {' '}
                  {/* Container for icon */}
                  {category.icon && category.icon}{' '}
                  {/* Ensure icon is always present */}
                </div>
                <Card.Text
                  className={`mt-2 text-center ${selectedCategory === category.name ? 'fw-bold' : ''}`} // Apply Bootstrap class for bold font weight
                  style={{ fontSize: '0.7rem', flex: 1 }} // Apply custom inline style for font size reduction and flex to fill remaining space
                >
                  {category.name}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryList;
