import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import orderBy from 'lodash/orderBy';
import cx from 'classnames';

import ObservedImage from '../ObservedImage';
import { ProfileLink } from '../../components/ProfileLink';
import ProgressBar from '../UI/ProgressBar';
import manifest from '../../utils/manifest';
import { enumerateRecordState } from '../../utils/destinyEnums';

import './styles.css';

class Records extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.highlight && this.scrollToRecordRef.current !== null) {
      window.scrollTo({
        top: this.scrollToRecordRef.current.offsetTop + this.scrollToRecordRef.current.offsetHeight / 2 - window.innerHeight / 2
      });
    }
  }

  trackThisClick = e => {
    let tracked = this.props.triumphs.tracked;
    let hashToTrack = parseInt(e.currentTarget.dataset.hash, 10);
    let target = tracked.indexOf(hashToTrack);

    if (target > -1) {
      tracked = tracked.filter((hash, index) => index !== target);
    } else {
      tracked.push(hashToTrack);
    }

    this.props.setTrackedTriumphs(tracked);
  };

  render() {
    const { t, hashes, member, triumphs, collectibles, ordered, limit, selfLinkFrom, readLink, forceDisplay = false } = this.props;
    const highlight = parseInt(this.props.highlight, 10) || false;
    const recordsRequested = hashes;
    const characterRecords = member.data.profile.characterRecords.data;
    const profileRecords = member.data.profile.profileRecords.data.records;
    const characterId = member.characterId;
    const tracked = triumphs.tracked;

    let recordsOutput = [];
    recordsRequested.forEach(hash => {
      const recordDefinition = manifest.DestinyRecordDefinition[hash];
      const recordScope = recordDefinition.scope || 0;
      const recordData = recordScope === 1 ? characterRecords[characterId].records[recordDefinition.hash] : profileRecords[recordDefinition.hash];

      let objectives = [];
      let completionValueTotal = 0;
      let progressValueTotal = 0;
      let link = false;

      // selfLink
      if (selfLinkFrom) {
        try {
          let reverse1;
          let reverse2;
          let reverse3;

          manifest.DestinyRecordDefinition[hash].presentationInfo.parentPresentationNodeHashes.forEach(element => {
            if (manifest.DestinyPresentationNodeDefinition[1652422747].children.presentationNodes.filter(el => el.presentationNodeHash === element).length > 0) {
              return; // if hash is a child of seals, skip it
            }
            if (reverse1) {
              return;
            }
            reverse1 = manifest.DestinyPresentationNodeDefinition[element];
          });

          let iteratees = reverse1.presentationInfo ? reverse1.presentationInfo.parentPresentationNodeHashes : reverse1.parentNodeHashes;
          iteratees.forEach(element => {
            if (reverse2) {
              return;
            }
            reverse2 = manifest.DestinyPresentationNodeDefinition[element];
          });

          if (reverse2 && reverse2.parentNodeHashes) {
            reverse3 = manifest.DestinyPresentationNodeDefinition[reverse2.parentNodeHashes[0]];
          }

          link = `/triumphs/${reverse3.hash}/${reverse2.hash}/${reverse1.hash}/${hash}`;
        } catch (e) {
          // console.log(e);
        }
      }

      // readLink
      if (recordDefinition.loreHash && !selfLinkFrom && readLink) {
        link = `/read/record/${recordDefinition.hash}`;
      }

      if (recordDefinition.objectiveHashes) {
        recordDefinition.objectiveHashes.forEach((hash, index) => {
          let objectiveDefinition = manifest.DestinyObjectiveDefinition[hash];

          let playerProgress = null;

          recordData.objectives.forEach(objective => {
            if (objective.objectiveHash === hash) {
              playerProgress = objective;
            }
          });

          // override
          if (hash === 1278866930 && playerProgress.complete) {
            playerProgress.progress = 16;
          }

          objectives.push(<ProgressBar key={`${hash}${index}`} objectiveDefinition={objectiveDefinition} playerProgress={playerProgress} />);

          if (playerProgress) {
            let v = parseInt(playerProgress.completionValue, 10);
            let p = parseInt(playerProgress.progress, 10);

            completionValueTotal = completionValueTotal + v;
            progressValueTotal = progressValueTotal + (p > v ? v : p); // prevents progress values that are greater than the completion value from affecting the average
          }
        });
      }

      let progressDistance = progressValueTotal / completionValueTotal;
      progressDistance = Number.isNaN(progressDistance) ? 0 : progressDistance;

      let state = recordData.state || 0;

      if (enumerateRecordState(state).invisible) {
        return;
      }

      if (enumerateRecordState(state).recordRedeemed && collectibles && collectibles.hideTriumphRecords && !forceDisplay) {
        return;
      }

      let ref = highlight === recordDefinition.hash ? this.scrollToRecordRef : null;

      if (recordDefinition.redacted) {
        recordsOutput.push({
          completed: enumerateRecordState(state).recordRedeemed,
          progressDistance,
          hash: recordDefinition.hash,
          element: (
            <li
              key={recordDefinition.hash}
              ref={ref}
              className={cx('redacted', {
                // eslint-disable-next-line eqeqeq
                highlight: highlight && highlight == recordDefinition.hash
              })}
            >
              <div className='properties'>
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage}`} />
                </div>
                <div className='text'>
                  <div className='name'>Classified record</div>
                  <div className='description'>This record is classified and may be revealed at a later time.</div>
                </div>
              </div>
            </li>
          )
        });
      } else {
        let description = recordDefinition.displayProperties.description !== '' ? recordDefinition.displayProperties.description : false;
        description = !description && recordDefinition.loreHash ? manifest.DestinyLoreDefinition[recordDefinition.loreHash].displayProperties.description.slice(0, 117).trim() + '...' : description;
        // if (recordDefinition.hash === 2367932631) { ????
        //   console.log(enumerateRecordState(state));
        // }

        let linkTo;
        if (link && selfLinkFrom) {
          linkTo = {
            pathname: link,
            state: {
              from: selfLinkFrom
            }
          };
        }
        if (link && readLink) {
          linkTo = {
            pathname: link,
            state: {
              from: this.props.location.pathname
            }
          };
        }

        recordsOutput.push({
          completed: enumerateRecordState(state).recordRedeemed,
          progressDistance,
          hash: recordDefinition.hash,
          element: (
            <li
              key={recordDefinition.hash}
              ref={ref}
              className={cx({
                linked: link && linkTo,
                highlight: highlight && highlight === recordDefinition.hash,
                completed: enumerateRecordState(state).recordRedeemed,
                unRedeemed: !enumerateRecordState(state).recordRedeemed && !enumerateRecordState(state).objectiveNotCompleted,
                tracked: tracked.includes(recordDefinition.hash) && !enumerateRecordState(state).recordRedeemed && enumerateRecordState(state).objectiveNotCompleted,
                'no-description': !description
              })}
            >
              {!enumerateRecordState(state).recordRedeemed && enumerateRecordState(state).objectiveNotCompleted ? (
                <div className='track-this' onClick={this.trackThisClick} data-hash={recordDefinition.hash}>
                  <div />
                </div>
              ) : null}
              <div className='properties'>
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${recordDefinition.displayProperties.icon}`} />
                </div>
                <div className='text'>
                  <div className='name'>{recordDefinition.displayProperties.name}</div>
                  <div className='meta'>
                    <div className='commonality'>{manifest.statistics.triumphs && manifest.statistics.triumphs[recordDefinition.hash] ? manifest.statistics.triumphs[recordDefinition.hash] : `0.00`}%</div>
                    {recordDefinition.completionInfo && recordDefinition.completionInfo.ScoreValue !== 0 ? <div className='score'>{recordDefinition.completionInfo.ScoreValue}</div> : null}
                  </div>
                  <div className='description'>{description}</div>
                </div>
              </div>
              <div className='objectives'>{objectives}</div>
              {link && linkTo ? !selfLinkFrom && readLink ? <Link to={linkTo} /> : <ProfileLink to={linkTo} /> : null}
            </li>
          )
        });
      }
    });

    if (recordsRequested.length > 0 && recordsOutput.length === 0 && collectibles && collectibles.hideTriumphRecords && !forceDisplay) {
      recordsOutput.push({
        element: (
          <li key='lol' className='all-completed'>
            <div className='properties'>
              <div className='text'>{t('All completed')}</div>
            </div>
          </li>
        )
      });
    }

    if (ordered === 'progress') {
      recordsOutput = orderBy(recordsOutput, [item => item.progressDistance], ['desc']);
    } else if (ordered) {
      recordsOutput = orderBy(recordsOutput, [item => item.completed], ['asc']);
    } else {
    }

    if (limit) {
      recordsOutput = recordsOutput.slice(0, limit);
    }

    return recordsOutput.map(obj => obj.element);
  }
}

function mapStateToProps(state, ownProps) {
  return {
    triumphs: state.triumphs
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTrackedTriumphs: value => {
      dispatch({ type: 'SET_TRACKED_TRIUMPHS', payload: value });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withNamespaces()
)(Records);
