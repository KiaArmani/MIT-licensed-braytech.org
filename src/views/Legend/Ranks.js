import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ProgressBar from '../../components/UI/ProgressBar';

class Ranks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, member } = this.props;
    const characterId = member.characterId;
    const characterProgressions = member.data.profile.characterProgressions.data;
    const profileRecords = member.data.profile.profileRecords.data.records;

    let infamyDefinition = manifest.DestinyProgressionDefinition[2772425241];
    let infamyProgression = characterProgressions[characterId].progressions[2772425241];
    let infamyProgressTotal = Object.keys(infamyDefinition.steps).reduce((sum, key) => {
      return sum + infamyDefinition.steps[key].progressTotal;
    }, 0);
    let infamyResets = profileRecords[3901785488] ? profileRecords[3901785488].objectives[0].progress : 0;

    let valorDefinition = manifest.DestinyProgressionDefinition[3882308435];
    let valorProgression = characterProgressions[characterId].progressions[3882308435];
    let valorProgressTotal = Object.keys(valorDefinition.steps).reduce((sum, key) => {
      return sum + valorDefinition.steps[key].progressTotal;
    }, 0);
    let valorResets = profileRecords[559943871] ? profileRecords[559943871].objectives[0].progress : 0;

    let gloryDefinition = manifest.DestinyProgressionDefinition[2679551909];
    let gloryProgression = characterProgressions[characterId].progressions[2679551909];
    let gloryProgressTotal = Object.keys(gloryDefinition.steps).reduce((sum, key) => {
      return sum + gloryDefinition.steps[key].progressTotal;
    }, 0);

    let progression = {
      ranks: {
        text: t('Ranks'),
        noInteraction: true,
        values: {
          infamy: {
            definition: infamyDefinition,
            mode: 'Gambit',
            icon: 'destiny-gambit',
            text: t('Infamy'),
            color: '#25986e',
            total: infamyProgressTotal,
            step: infamyProgression,
            resets: infamyResets
          },
          valor: {
            definition: valorDefinition,
            mode: 'Quickplay',
            icon: 'destiny-faction_crucible_valor',
            text: t('Valor'),
            color: '#ed792c',
            total: valorProgressTotal,
            step: valorProgression,
            resets: valorResets
          },
          glory: {
            definition: gloryDefinition,
            mode: 'Competitive',
            icon: 'destiny-faction_crucible_glory',
            text: t('Glory'),
            color: '#b52422',
            total: gloryProgressTotal,
            step: gloryProgression,
            resets: false
          }
        }
      }
    };

    let ranks = [];

    for (const [key, value] of Object.entries(progression.ranks.values)) {
      ranks.push(
        <div className={cx('rank', key)} key={key}>
          <div className='head'>
            <div className='icon'>
              <span className={value.icon} />
            </div>
            <div className='name'>{value.mode}</div>
            {value.resets ? <div className='resets'>{value.resets} resets</div> : null}
          </div>
          <div className='progress'>
            <ProgressBar
              classNames={{
                disabled: value.step.currentProgress === value.total && key === 'glory'
              }}
              objectiveDefinition={{
                progressDescription: `Next rank: ${value.step.currentProgress === value.total && value.step.stepIndex === value.definition.steps.length ? value.definition.steps[0].stepName : value.definition.steps[(value.step.stepIndex + 1) % value.definition.steps.length].stepName}`,
                completionValue: value.step.nextLevelAt
              }}
              playerProgress={{
                progress: value.step.progressToNextLevel,
                objectiveHash: value.mode
              }}
              hideCheck
              chunky
            />
            <ProgressBar
              objectiveDefinition={{
                progressDescription: value.text,
                completionValue: value.total
              }}
              playerProgress={{
                progress: value.step.currentProgress,
                objectiveHash: value.mode
              }}
              hideCheck
              chunky
            />
          </div>
        </div>
      );
    }

    return ranks;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Ranks);
