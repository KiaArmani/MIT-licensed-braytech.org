import React from 'react';
import cx from 'classnames';

import ObservedImage from '../../ObservedImage';
import ProgressBar from '../../UI/ProgressBar';
import manifest from '../../../utils/manifest';

const bounty = item => {
  let description = item.displaySource !== '' ? item.displaySource : false;

  let objective = item.displayProperties.description;
  let objectives = [];
  let rewards = [];

  item.objectives.objectiveHashes.forEach(element => {
    let objectiveDefinition = manifest.DestinyObjectiveDefinition[element];

    let playerProgress = {
      complete: false,
      progress: 0,
      objectiveHash: objectiveDefinition.hash
    };

    objectives.push(<ProgressBar key={objectiveDefinition.hash} objectiveDefinition={objectiveDefinition} playerProgress={playerProgress} />);
  });

  item.value.itemValue.forEach(value => {
    if (value.itemHash !== 0) {
      let definition = manifest.DestinyInventoryItemDefinition[value.itemHash];
      rewards.push(
        <li key={value.itemHash}>
          <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${definition.displayProperties.icon}`} />
          <div className='text'>
            {definition.displayProperties.name}
            {value.quantity > 1 ? <> +{value.quantity}</> : null}
          </div>
        </li>
      );
    }
  });

  return (
    <>
      <div className='objective'>{objective}</div>
      {objectives ? <div className='objectives'>{objectives}</div> : null}
      {description ? (
        <div className='description'>
          <pre>{description}</pre>
        </div>
      ) : null}
      {rewards.length ? (
        <div className='rewards'>
          <ul>{rewards}</ul>
        </div>
      ) : null}
    </>
  );
};

export default bounty;
