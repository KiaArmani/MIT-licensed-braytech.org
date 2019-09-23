import React from 'react';

import ObservedImage from '../../ObservedImage';

const subclass = item => {
  return (
    <div className='perk'>
      <ObservedImage className='image icon' src={`https://www.bungie.net${item.displayProperties.icon}`} />
      <div className='text'>
        <div className='description'>{item.displayProperties.description}</div>
      </div>
    </div>
  );
};

export default subclass;
