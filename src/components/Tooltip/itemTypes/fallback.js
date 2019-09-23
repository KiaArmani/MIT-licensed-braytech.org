import React from 'react';
import '../../../utils/destinyEnums';
import manifest from '../../../utils/manifest';

const fallback = item => {
  let sourceString = item.collectibleHash ? (manifest.DestinyCollectibleDefinition[item.collectibleHash] ? manifest.DestinyCollectibleDefinition[item.collectibleHash].sourceString : false) : false;

  let description = item.displayProperties.description !== '' ? item.displayProperties.description : false;

  return (
    <>
      {description ? (
        <div className='description'>
          <pre>{description}</pre>
        </div>
      ) : null}
      {sourceString ? (
        <div className='source'>
          <p>{sourceString}</p>
        </div>
      ) : null}
    </>
  );
};

export default fallback;
