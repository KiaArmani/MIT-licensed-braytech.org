import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../../components/ObservedImage';
import Records from '../../../components/Records';

class SealNode extends React.Component {
  render() {
    const { t } = this.props;
    const characterId = this.props.member.characterId;

    const characters = this.props.member.data.profile.characters.data;
    const genderHash = characters.find(character => character.characterId === characterId).genderHash;
    const profileRecords = this.props.member.data.profile.profileRecords.data.records;

    const sealBars = {
      2588182977: {
        text: manifest.DestinyRecordDefinition[2757681677].titleInfo.titlesByGenderHash[genderHash],
        image: '037E-00001367.png',
        nodeHash: 2588182977,
        recordHash: 2757681677,
        total: profileRecords[2757681677].objectives[0].completionValue,
        completed: profileRecords[2757681677].objectives[0].progress
      },
      3481101973: {
        text: manifest.DestinyRecordDefinition[3798931976].titleInfo.titlesByGenderHash[genderHash],
        image: '037E-00001343.png',
        nodeHash: 3481101973,
        recordHash: 3798931976,
        total: profileRecords[3798931976].objectives[0].completionValue,
        completed: profileRecords[3798931976].objectives[0].progress
      },
      147928983: {
        text: manifest.DestinyRecordDefinition[3369119720].titleInfo.titlesByGenderHash[genderHash],
        image: '037E-0000134A.png',
        nodeHash: 147928983,
        recordHash: 3369119720,
        total: profileRecords[3369119720].objectives[0].completionValue,
        completed: profileRecords[3369119720].objectives[0].progress
      },
      2693736750: {
        text: manifest.DestinyRecordDefinition[1754983323].titleInfo.titlesByGenderHash[genderHash],
        image: '037E-0000133C.png',
        nodeHash: 2693736750,
        recordHash: 1754983323,
        total: profileRecords[1754983323].objectives[0].completionValue,
        completed: profileRecords[1754983323].objectives[0].progress
      },
      2516503814: {
        text: manifest.DestinyRecordDefinition[1693645129].titleInfo.titlesByGenderHash[genderHash],
        image: '037E-00001351.png',
        nodeHash: 2516503814,
        recordHash: 1693645129,
        total: profileRecords[1693645129].objectives[0].completionValue,
        completed: profileRecords[1693645129].objectives[0].progress
      },
      1162218545: {
        text: manifest.DestinyRecordDefinition[2182090828].titleInfo.titlesByGenderHash[genderHash],
        image: '037E-00001358.png',
        nodeHash: 1162218545,
        recordHash: 2182090828,
        total: profileRecords[2182090828].objectives[0].completionValue,
        completed: profileRecords[2182090828].objectives[0].progress
      },
      2039028930: {
        text: manifest.DestinyRecordDefinition[2053985130].titleInfo.titlesByGenderHash[genderHash],
        image: '0560-000000EB.png',
        nodeHash: 2039028930,
        recordHash: 2053985130,
        total: profileRecords[2053985130].objectives[0].completionValue,
        completed: profileRecords[2053985130].objectives[0].progress
      },
      991908404: {
        text: manifest.DestinyRecordDefinition[1313291220].titleInfo.titlesByGenderHash[genderHash],
        image: '0560-0000107E.png',
        nodeHash: 991908404,
        recordHash: 1313291220,
        total: profileRecords[1313291220].objectives[0].completionValue,
        completed: profileRecords[1313291220].objectives[0].progress
      }
    };

    let sealDefinition = manifest.DestinyPresentationNodeDefinition[this.props.match.params.secondary];

    let completed = sealBars[sealDefinition.hash].completed === sealBars[sealDefinition.hash].total ? true : false;

    return (
      <div className='node seal'>
        <div className='children'>
          <div className='icon'>
            <div className='corners t' />
            <ObservedImage className={cx('image')} src={`/static/images/extracts/badges/${sealBars[sealDefinition.hash].image}`} />
            <div className='corners b' />
          </div>
          <div className='text'>
            <div className='name'>{sealDefinition.displayProperties.name}</div>
            <div className='description'>{sealDefinition.displayProperties.description}</div>
          </div>
          <div className='until'>
            {completed ? <h4 className='completed'>{t('Seal completed')}</h4> : <h4>{t('Seal progress')}</h4>}
            <div className='progress'>
              <div className='text'>
                <div className='title'>{sealBars[sealDefinition.hash].text}</div>
                <div className='fraction'>
                  {sealBars[sealDefinition.hash].completed}/{sealBars[sealDefinition.hash].total}
                </div>
              </div>
              <div className={cx('bar', { completed: completed })}>
                <div
                  className='fill'
                  style={{
                    width: `${(sealBars[sealDefinition.hash].completed / sealBars[sealDefinition.hash].total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='records'>
          <ul className='list no-interaction tertiary record-items'>
            <Records {...this.props} hashes={sealDefinition.children.records.map(child => child.recordHash)} />
          </ul>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme,
    collectibles: state.collectibles
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(SealNode);
