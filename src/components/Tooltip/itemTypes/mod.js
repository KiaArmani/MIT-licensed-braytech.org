import React from 'react';
import cx from 'classnames';

import manifest from '../../../utils/manifest';

const mod = item => {

  let stats = [];
  item.investmentStats.forEach(stat => {
    let definition = manifest.DestinyStatDefinition[stat.statTypeHash];
    stats.push(
      <div key={stat.hash} className='stat'>
        <div className='name'>{definition.displayProperties.name}</div>
        <div className='value int'>+{stat.value}</div>
      </div>
    );
  });
  
  return (
    <>
      {stats.length > 0 ? <div className='stats'>{stats}</div> : null}
      <div className={cx('description', { 'has-stats': stats.length })}>
        <pre>{item.displayProperties.description}</pre>
      </div>
    </>
  );
};

export default mod;
