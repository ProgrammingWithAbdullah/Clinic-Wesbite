import React from 'react';
import '../App.css';

const Hero = ({
  title = 'Patient Data',
  subtitle = 'Manage and Handle Patient Data',
}) => {
  return (
    <section className='hero'>
      <h1 className='title'>{title}</h1>
    </section>
  );
};

export default Hero;
