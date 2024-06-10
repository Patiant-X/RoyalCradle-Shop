import { useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const MapComponent = ({ setAddressCoordinates }) => {
  const autoCompleteRef = useRef();
  const inputRef = useRef();
  const options = {
    componentRestrictions: {
      country: 'za',
    },
    fields: ['address_components', 'geometry', 'icon', 'name'],
    types: ['geocode'],
  };

  useEffect(() => {
    const loadMap = () => {
      try {
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          options
        );

        // Handle place selection
        autoCompleteRef.current.addListener('place_changed', () => {
          const place = autoCompleteRef.current.getPlace();

          // Check if place object exists
          if (!place || !place.geometry) {
            toast.error('Unable to retrieve location. Please try again.');
            return;
          }
          // Extract latitude and longitude
          const { lat, lng } = place.geometry.location;

          // Check if lat and lng functions exist
          if (
            !lat ||
            !lng ||
            typeof lat !== 'function' ||
            typeof lng !== 'function'
          ) {
            // display an error message to the user
            toast.error('Unable to retrieve location. Please try again.');
            return;
          }
          // Pass coordinates to parent component
          setAddressCoordinates({
            place,
            lat: lat(),
            lng: lng(),
          });
        });
      } catch (error) {
        console.error(
          'Error loading Google Maps API: Try using a different device'
        );
      }
    };

    if (window.google && window.google.maps) {
      loadMap();
    } else {
      const script = document.createElement('script');
      script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyCOzCJeQBUPM_kVwwsawUwvd8QxRsW78dg&libraries=places';
      script.async = true;
      script.onload = loadMap;
      script.onerror = () =>
        console.error('Error loading Google Maps API');
      document.head.appendChild(script);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        style={{
          padding: '5px',
          width: '100%',
          borderRadius: '5px',
          border: '1px solid #b5c0c1',
          marginBottom: '10px',
          height: '50px'
        }}
        placeholder='Enter street address'
      />
    </>
  );
};

export default MapComponent;
