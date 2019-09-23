import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import moment from 'moment';
import Moment from 'react-moment';
import orderBy from 'lodash/orderBy';

import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';
import Spinner from '../../components/UI/Spinner';

class NightfallHighScores extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, member, PGCRcache, cacheState, cacheLoading } = this.props;
    const characterIds = member.data.profile.characters.data.map(c => c.characterId);

    let nightfalls = [
      {
        directorActivityHash: 936308438,
        name: 'Nightfall: A Garden World'
      },
      {
        directorActivityHash: 1282886582,
        name: 'Nightfall: Exodus Crash'
      },
      {
        directorActivityHash: 3372160277,
        name: 'Nightfall: Lake of Shadows'
      },
      {
        directorActivityHash: 3280234344,
        name: "Nightfall: Savathûn's Song"
      },
      {
        directorActivityHash: 522318687,
        name: 'Nightfall: Strange Terrain'
      },
      {
        directorActivityHash: 3145298904,
        name: 'Nightfall: The Arms Dealer'
      },
      {
        directorActivityHash: 3034843176,
        name: 'Nightfall: The Corrupted'
      },
      {
        directorActivityHash: 3701132453,
        name: 'Nightfall: The Hollowed Lair'
      },
      {
        directorActivityHash: 1034003646,
        name: 'Nightfall: The Insight Terminus'
      },
      {
        directorActivityHash: 4259769141,
        name: 'Nightfall: The Inverted Spire'
      },
      {
        directorActivityHash: 3289589202,
        name: 'Nightfall: The Pyramidion'
      },
      {
        directorActivityHash: 3718330161,
        name: 'Nightfall: Tree of Probabilities'
      },
      {
        directorActivityHash: 3108813009,
        name: 'Nightfall: Warden of Nothing'
      },
      {
        directorActivityHash: 272852450,
        name: 'Nightfall: Will of the Thousands'
      }
    ];

    let nfPGCRs = [];
    let sumKills = 0;
    let sumDeaths = 0;
    let sumCleared = 0;
    let sumDuration = 0;
    let sumSuperKills = 0;
    if (PGCRcache[member.membershipId]) {
      nfPGCRs = PGCRcache[member.membershipId].filter(pgcr => pgcr.activityDetails.mode === 46);

      nfPGCRs.forEach(pgcr => {
        let nightfall = nightfalls.find(nf => nf.directorActivityHash === pgcr.activityDetails.directorActivityHash);
        if (!nightfall) {
          return;
        }

        nightfall.clears = nightfall.clears ? nightfall.clears + 1 : 1;

        let entry = pgcr.entries.find(entry => characterIds.includes(entry.characterId));
        if (entry) {
          sumKills = sumKills + entry.values.kills.basic.value;
          sumDeaths = sumDeaths + entry.values.deaths.basic.value;
          sumDuration = sumDuration + entry.values.activityDurationSeconds.basic.value;
          if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
            sumCleared = sumCleared + entry.values.completed.basic.value;
          }
          sumSuperKills = sumSuperKills + entry.extended.values.weaponKillsSuper.basic.value;

          let bestTime = nightfall.bestTime || 3600;
          if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0 && entry.values.activityDurationSeconds.basic.value !== 0 && entry.values.activityDurationSeconds.basic.value < bestTime) {
            nightfall.bestTime = entry.values.activityDurationSeconds.basic.value;
            nightfall.bestTimeInstanceId = pgcr.activityDetails.instanceId;
          }
        }

        let clear = false;
        let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
        entries.forEach(entry => {
          if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
            clear = true;
          }
        });

        let sumScore = 0;
        let highScore = nightfall.highScore || 0;

        if (clear) {
          pgcr.entries.forEach(entry => {
            sumScore = sumScore + entry.score.basic.value;
          });
          if (sumScore > highScore) {
            nightfall.highScore = sumScore;
            nightfall.highScoreInstanceId = pgcr.activityDetails.instanceId;
          }
        }
      });
    }

    // console.log(nightfalls);

    let list = nightfalls.map(nf => {
      let definition = manifest.DestinyActivityDefinition[nf.directorActivityHash];

      return {
        clears: nf.clears || false,
        highScore: nf.highScore || 0,
        highScoreInstanceId: nf.highScoreInstanceId,
        bestTime: nf.bestTime || false,
        bestTimeInstanceId: nf.bestTimeInstanceId,
        definition: definition,
        element: (
          <li key={definition.hash} className={cx({ lowScore: (nf.highScore || 0) < 100000 })}>
            <div className='name'>{definition.selectionScreenDisplayProperties.name}</div>
            <div className='score'>{!nf.highScore ? '—' : nf.highScore.toLocaleString()}</div>
          </li>
        )
      };
    });

    list = orderBy(list, [nf => nf.highScore], ['desc']);
    let topNightfall = list[0];
    let topNightfallPGCR = PGCRcache[member.membershipId] ? PGCRcache[member.membershipId].find(pgcr => pgcr.activityDetails.instanceId === topNightfall.highScoreInstanceId) : false;

    let tempList = orderBy(list.filter(nf => nf.bestTime), [nf => nf.bestTime], ['asc']);
    let fastestNightfall = tempList[0];
    // let fastestNightfallPGCR;
    // if (fastestNightfall && fastestNightfall.bestTimeInstanceId) {
    //   fastestNightfallPGCR = PGCRcache[member.membershipId] ? PGCRcache[member.membershipId].find(pgcr => pgcr.activityDetails.instanceId === fastestNightfall.bestTimeInstanceId) : false;
    // }

    let favourite = orderBy(list.filter(nf => nf.clears), [nf => nf.clears], ['desc'])[0];

    return (
      <>
        <div className='bg' />
        <div className='top'>
          {topNightfall && topNightfallPGCR ? (
            <>
              <ObservedImage className='image pgcrImage' src={`https://www.bungie.net${topNightfall.definition.pgcrImage}`} />
              <div className='head'>
                <div className='page-header'>
                  <div className='name'>{t('Nightfalls')}</div>
                  <div className='description'>{t('Your hard-won high scores from your fight against the most feared minions of the Darkness')}</div>
                </div>
              </div>
              <div className='properties'>
                <div className='desc'>Top score</div>
                <div className='name'>{topNightfall.definition.selectionScreenDisplayProperties.name}</div>
                <div className='score'>{topNightfall.highScore.toLocaleString()}</div>
              </div>
              <div className='fireteam'>
                <div className='sub-header sub'>
                  <div>Fireteam</div>
                  <div>
                    <Moment format='D/M/YYYY'>{topNightfallPGCR.period}</Moment>
                  </div>
                </div>
                <ul className='list'>
                  {topNightfallPGCR.entries.map(entry => {
                    return (
                      <li key={entry.characterId} className='linked'>
                        <div className='icon'>
                          <ObservedImage className={cx('image', 'emblem')} src={`https://www.bungie.net${entry.player.destinyUserInfo.iconPath}`} />
                        </div>
                        <div className='displayName'>{entry.player.destinyUserInfo.displayName}</div>
                        <Link to={`/${entry.player.destinyUserInfo.membershipType}/${entry.player.destinyUserInfo.membershipId}/${entry.characterId}/`} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          ) : null}
        </div>
        <div className='chart'>
          <ul className='list'>
            <li key='header'>
              <div className='name' />
              <div className='score'>High score</div>
            </li>
            {list.map(item => item.element)}
          </ul>
        </div>
        <div className='summary'>
          <div className='datum'>
            <div className='d w'>
              <div className='b'>{favourite ? <>{favourite.clears} clears</> : ` `}</div>
              <div className='v'>{favourite ? <>{favourite.definition.selectionScreenDisplayProperties.name}</> : `—`}</div>
              <div className='n'>{t('favourite')}</div>
            </div>
            <div className='d w'>
              <div className='b'>
                {fastestNightfall ? (
                  <>
                    {moment.duration(fastestNightfall.bestTime, 'seconds').minutes()}
                    <span>m</span> {moment.duration(fastestNightfall.bestTime, 'seconds').seconds()}
                    <span>s</span>
                  </>
                ) : (
                  ` `
                )}
              </div>
              <div className='v'>{fastestNightfall ? <>{fastestNightfall.definition.selectionScreenDisplayProperties.name}</> : `—`}</div>
              <div className='n'>{t('fastest clear')}</div>
            </div>
            <div className='d'>
              <div className='v'>{sumKills.toLocaleString()}</div>
              <div className='n'>{t('kills')}</div>
            </div>
            <div className='d'>
              <div className='v'>{sumDeaths.toLocaleString()}</div>
              <div className='n'>{t('deaths')}</div>
            </div>
            <div className='d'>
              <div className='v'>{sumSuperKills.toLocaleString()}</div>
              <div className='n'>{t('super kills')}</div>
            </div>
            <div className='d'>
              <div className='v'>{sumCleared.toLocaleString()}</div>
              <div className='n'>{t('completed')}</div>
            </div>
            <div className='d w'>
              <div className='v'>{Math.floor(parseInt(sumDuration) / 3600)}</div>
              <div className='n'>{Math.floor(parseInt(sumDuration) / 3600) === 1 ? t('hour played') : t('hours played')}</div>
            </div>
          </div>
          <div className='state'>{cacheLoading ? <Spinner mini /> : cacheState[46] !== nfPGCRs.length ? <p>{cacheState[46] - nfPGCRs.length} PGCRs failed to load at this minute therefore their stats are not included.</p> : null}</div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    PGCRcache: state.PGCRcache
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(NightfallHighScores);
