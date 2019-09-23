import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import { ProfileLink } from '../../ProfileLink';
import { enumerateRecordState } from '../../../utils/destinyEnums';

import './styles.css';

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */

function difference(object, base) {
  function changes(object, base) {
    return _.transform(object, function(result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] = _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}

class NotificationProgress extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: {
        type: false,
        hash: false,
        number: 0,
        timedOut: true
      }
    };
    this.timer = false;
  }

  timeOut = () => {
    if (!this.timer && !this.state.progress.timedOut && this.state.progress.hash) {
      this.timer = setTimeout((prevState = this.state) => {
        this.timer = false;
        console.log('timed out');
        this.setState({
          progress: {
            type: prevState.progress.type,
            hash: prevState.progress.hash,
            timedOut: true
          }
        });
      }, 10000);
    }
  };

  componentDidUpdate(prevProps) {
    this.timeOut();

    const fresh = this.props.member.data;
    const stale = this.props.member.prevData ? this.props.member.prevData : false;
    const characterId = this.props.member.characterId;

    if (prevProps.member.membershipId !== this.props.member.membershipId) {
      // console.log('membershipId mismatch');
      return;
    }

    if (!stale) {
      // console.log('not stale yet');
      return;
    }

    // console.log('characters', difference(fresh.profile.characters, stale.profile.characters));
    // console.log('profileRecords', difference(fresh.profile.profileRecords.data.records, stale.profile.profileRecords.data.records));
    // console.log('characterRecords', difference(fresh.profile.characterRecords.data[characterId].records, stale.profile.characterRecords.data[characterId].records));
    // console.log('profileProgression', difference(fresh.profile.profileProgression, stale.profile.profileProgression));
    // console.log('characterProgressions', difference(fresh.profile.characterProgressions.data[characterId], stale.profile.characterProgressions.data[characterId]));
    // console.log('profileCollectibles', difference(fresh.profile.profileCollectibles.data.collectibles, stale.profile.profileCollectibles.data.collectibles));
    // console.log('characterCollectibles', difference(fresh.profile.characterCollectibles.data[characterId].collectibles, stale.profile.characterCollectibles.data[characterId].collectibles));

    if (!this.state.progress.timedOut) {
      // console.log('not timed out yet');
      return;
    }

    let profileRecords = difference(fresh.profile.profileRecords.data.records, stale.profile.profileRecords.data.records);
    let characterRecords = difference(fresh.profile.characterRecords.data[characterId].records, stale.profile.characterRecords.data[characterId].records);

    // console.log(profileRecords);

    let progress = {
      type: false,
      hash: false,
      number: 0,
      timedOut: false
    };

    if (Object.keys(profileRecords).length > 0) {
      Object.keys(profileRecords).forEach(key => {
        if (profileRecords[key].state === undefined) {
          return;
        }
        let state = enumerateRecordState(profileRecords[key].state);
        // console.log(state);
        if (!state.objectiveNotCompleted && !state.recordRedeemed) {
          if (progress.hash) {
            progress.number = progress.number + 1;
            return;
          }
          progress.type = 'record';
          progress.hash = key;
          progress.number = progress.number + 1;
        }
      });
    }

    if (Object.keys(characterRecords).length > 0) {
      Object.keys(characterRecords).forEach(key => {
        if (characterRecords[key].state === undefined) {
          return;
        }
        let state = enumerateRecordState(characterRecords[key].state);
        // console.log(state);
        if (!state.objectiveNotCompleted && !state.recordRedeemed) {
          if (progress.hash) {
            progress.number = progress.number + 1;
            return;
          }
          progress.type = 'record';
          progress.hash = key;
          progress.number = progress.number + 1;
        }
      });
    }

    if (this.state.progress.timedOut && progress.type && this.state.progress.hash !== progress.hash) {
      this.setState({
        progress: progress
      });
    }
  }

  render() {
    const { t } = this.props;

    if (this.state.progress.type === 'record') {
      let record = manifest.DestinyRecordDefinition[this.state.progress.hash];

      let link = false;
      try {
        let reverse1;
        let reverse2;
        let reverse3;

        manifest.DestinyRecordDefinition[record.hash].presentationInfo.parentPresentationNodeHashes.forEach(element => {
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

        link = `/triumphs/${reverse3.hash}/${reverse2.hash}/${reverse1.hash}/${record.hash}`;
      } catch (e) {
        // console.log(e);
      }

      let description = record.displayProperties.description !== '' ? record.displayProperties.description : false;
      description = !description && record.loreHash ? manifest.DestinyLoreDefinition[record.loreHash].displayProperties.description.slice(0, 117).trim() + '...' : description;
      return (
        <div id='notification-progress' className={cx('record', { lore: record.loreHash, timedOut: this.state.progress.timedOut })}>
          <div className='type'>
            <div className='text'>Triumph completed</div>
          </div>
          <div className='item'>
            <div className='properties'>
              <div className='name'>{record.displayProperties.name}</div>
              <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${record.displayProperties.icon}`} noConstraints />
              <div className='description'>{description}</div>
            </div>
            {this.state.progress.number > 1 ? <div className='more'>And {this.state.progress.number - 1} more</div> : null}
          </div>
          {link ? <ProfileLink to={link} /> : null}
        </div>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(NotificationProgress);
