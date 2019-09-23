import React from 'react';
import cx from 'classnames';

import { stringToIcons } from '../../../utils/destinyUtils';

import './styles.css';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let { progressDescription = '', completionValue, allowOvercompletion = true } = this.props.objectiveDefinition;
    let { complete = false, progress, objectiveHash } = this.props.playerProgress;
    let classNames = this.props.classNames;
    let hideCheck = this.props.hideCheck;
    let chunky = this.props.chunky;

    progressDescription = stringToIcons(progressDescription);

    progress = allowOvercompletion ? progress : Math.min(progress, completionValue);
    let wholeFraction = completionValue === 1 ? true : false;
    let completeText = complete ? 'Complete' : 'Incomplete';

    return (
      <div key={objectiveHash} className={cx('progress-bar', classNames, { complete: complete, chunky: chunky })}>
        {!hideCheck ? <div className={cx('check', { ed: complete })} /> : null}
        <div className={cx('bar', { full: hideCheck })}>
          <div className='text'>
            <div className='description'>{progressDescription !== '' ? progressDescription : completeText}</div>
            {!wholeFraction ? (
              <div className='fraction'>
                {progress}/{completionValue}
              </div>
            ) : null}
          </div>
          <div className='fill' style={{ width: `${(progress / completionValue) * 100}%` }} />
        </div>
      </div>
    );
  }
}

export default ProgressBar;
