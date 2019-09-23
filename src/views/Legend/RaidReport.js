import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import Moment from 'react-moment';
import { orderBy, flattenDepth } from 'lodash';

import ObservedImage from '../../components/ObservedImage';
import Spinner from '../../components/UI/Spinner';

class RaidReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  // fetchReport = async membershipId => {
  //   const request = await fetch(`https://b9bv2wd97h.execute-api.us-west-2.amazonaws.com/prod/api/player/${membershipId}`).then(r => r.json());

  //   if (!request.response) {
  //     console.log('fetch error');
  //   }

  //   return request.response;
  // };

  // async componentDidMount() {
  //   const { member } = this.props;

  //   // this.raidReport = await this.fetchReport(member.membershipId);
  // }

  render() {
    const { t, member, PGCRcache, cacheState, cacheLoading } = this.props;
    const characterIds = member.data.profile.characters.data.map(c => c.characterId);

    const getBungiePGCRImage = path => {
      return `https://stats.bungie.net/img/destiny_content/pgcr/${path}.jpg`;
    };

    const LEVIATHAN = {
      displayValue: 'Leviathan',
      boss: 'Calus',
      image: getBungiePGCRImage('raid_gluttony'),
      launchTime: '2017-09-13T17:00:00.000Z',
      versions: [
        {
          activityHashes: [417231112, 757116822, 1685065161, 2449714930, 3446541099, 3879860661],
          displayValue: 'Prestige'
        },
        {
          activityHashes: [2693136600, 2693136601, 2693136602, 2693136603, 2693136604, 2693136605],
          displayValue: 'Normal'
        },
        {
          activityHashes: [89727599, 287649202, 1699948563, 1875726950, 3916343513, 4039317196],
          displayValue: 'Guided Games'
        }
      ],
      additionalStartingPhaseIndexes: [2],
      fullClearPhases: [0]
    };

    const EATER_OF_WORLDS = {
      displayValue: 'Eater of Worlds',
      boss: 'Argos',
      image: getBungiePGCRImage('raids_leviathan_eater_of_worlds'),
      launchTime: '2017-12-08T18:00:00.000Z',
      versions: [
        {
          activityHashes: [809170886],
          displayValue: 'Prestige'
        },
        {
          activityHashes: [3089205900],
          displayValue: 'Normal'
        },
        {
          activityHashes: [2164432138],
          displayValue: 'Guided Games'
        }
      ],
      fullClearPhases: [0]
    };

    const SPIRE_OF_STARS = {
      displayValue: 'Spire of Stars',
      boss: `Val Ca'uor`,
      image: getBungiePGCRImage('raid_greed'),
      launchTime: '2018-05-11T17:00:00.000Z',
      versions: [
        {
          activityHashes: [3213556450],
          displayValue: 'Prestige'
        },
        {
          activityHashes: [119944200],
          displayValue: 'Normal'
        },
        {
          activityHashes: [3004605630],
          displayValue: 'Guided Games'
        }
      ],
      fullClearPhases: [0]
    };

    const LAST_WISH = {
      displayValue: 'Last Wish',
      boss: 'Riven',
      image: getBungiePGCRImage('raid_beanstalk'),
      launchTime: '2018-09-14T17:00:00.000Z',
      versions: [
        {
          activityHashes: [2122313384],
          displayValue: 'Normal'
        },
        {
          activityHashes: [1661734046],
          displayValue: 'Guided Games'
        }
      ],
      fullClearPhases: [0],
      flawlessRecordHash: 4177910003
    };

    const SCOURGE_OF_THE_PAST = {
      displayValue: 'Scourge of the Past',
      boss: 'Insurrection Prime',
      image: '/static/images/sotp.jpg',
      launchTime: '2018-12-07T17:00:00.000Z',
      versions: [
        {
          activityHashes: [548750096],
          displayValue: 'Normal'
        },
        {
          activityHashes: [2812525063],
          displayValue: 'Guided Games'
        }
      ],
      fullClearPhases: [0],
      flawlessRecordHash: 2648109757
    };

    

    let firstSotpClear = false;
    let raids = [];
    let raidReports = [];
    let aggregates = {};
    if (PGCRcache[member.membershipId]) {
      raidReports = PGCRcache[member.membershipId].filter(pgcr => pgcr.activityDetails.mode === 4);

      const getAgg = raid => {
        return raidReports
          .filter(pgcr =>
            flattenDepth(raid.versions.map(v => v.activityHashes), 1)
              .includes(pgcr.activityDetails.directorActivityHash)
          )
          .filter(pgcr => {
            let clear = false;
            let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
            entries.forEach(entry => {
              if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
                clear = true;
              }
            });
            return clear;
          });
      };

      const getAggCleared = () => {
        return raidReports
          .filter(pgcr =>
            flattenDepth(flattenDepth([LEVIATHAN, EATER_OF_WORLDS, SPIRE_OF_STARS, LAST_WISH, SCOURGE_OF_THE_PAST]
              .map(raid => raid.versions), 1)
              .map(raid => raid.activityHashes), 1)
              .includes(pgcr.activityDetails.directorActivityHash)
          )
          .filter(pgcr => {
            let clear = false;
            let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
            entries.forEach(entry => {
              if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
                clear = true;
              }
            });
            return clear;
          });
      };

      const getNormal = raid => {
        return raidReports
          .filter(pgcr => raid.versions.find(v => v.displayValue === 'Normal').activityHashes.includes(pgcr.activityDetails.directorActivityHash))
          // .filter(pgcr => raid.additionalStartingPhaseIndexes ? raid.fullClearPhases.concat(raid.additionalStartingPhaseIndexes).includes(pgcr.startingPhaseIndex) : raid.fullClearPhases.includes(pgcr.startingPhaseIndex))
          .filter(pgcr => {
            let clear = false;
            let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
            entries.forEach(entry => {
              if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
                clear = true;
              }
            });
            return clear;
          });
      };

      const getPrestige = raid => {
        return raidReports
          .filter(pgcr => raid.versions.find(v => v.displayValue === 'Prestige').activityHashes.includes(pgcr.activityDetails.directorActivityHash))
          // .filter(pgcr => raid.additionalStartingPhaseIndexes ? raid.fullClearPhases.concat(raid.additionalStartingPhaseIndexes).includes(pgcr.startingPhaseIndex) : raid.fullClearPhases.includes(pgcr.startingPhaseIndex))
          .filter(pgcr => {
            let clear = false;
            let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
            entries.forEach(entry => {
              if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
                clear = true;
              }
            });
            return clear;
          });
      };

      const getFlawless = raid => {
        return raidReports
          .filter(pgcr =>
            flattenDepth(raid.versions
              .map(v => v.activityHashes), 1)
              .includes(pgcr.activityDetails.directorActivityHash)
          )
          .filter(pgcr => raid.fullClearPhases.includes(pgcr.startingPhaseIndex))
          .filter(pgcr => {
            let undying = true;
            pgcr.entries.forEach(entry => {
              if (entry.values.deaths.basic.value !== 0) {
                undying = false;
              }
            });
            return undying;
          })
          .filter(pgcr => {
            let clear = false;
            let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
            entries.forEach(entry => {
              if (entry.values.completed.basic.value === 1 && entry.values.completionReason.basic.value === 0) {
                clear = true;
              }
            });
            return clear;
          });
      };

      let aggCleared = getAggCleared();

      aggregates.timePlayed = aggCleared.reduce((a, pgcr) => {
        let v = 0;
        let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
        entries.forEach(entry => {
          v = v + entry.values.timePlayedSeconds.basic.value;
        });
        return a + v;
      }, 0);

      aggregates.kills = aggCleared.reduce((a, pgcr) => {
        let v = 0;
        let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
        entries.forEach(entry => {
          v = v + entry.values.kills.basic.value;
        });
        return a + v;
      }, 0);

      aggregates.deaths = aggCleared.reduce((a, pgcr) => {
        let v = 0;
        let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
        entries.forEach(entry => {
          v = v + entry.values.deaths.basic.value;
        });
        return a + v;
      }, 0);

      aggregates.superKills = aggCleared.reduce((a, pgcr) => {
        let v = 0;
        let entries = pgcr.entries.filter(entry => characterIds.includes(entry.characterId));
        entries.forEach(entry => {
          v = v + entry.extended.values.weaponKillsSuper.basic.value;
        });
        return a + v;
      }, 0);

      let levAgg = getAgg(LEVIATHAN);
      let levNormal = getNormal(LEVIATHAN);
      let levPrestige = getPrestige(LEVIATHAN);
      let levFastest = orderBy(levAgg.filter(p => p.startingPhaseIndex === 0), [p => p.entries[0].values.activityDurationSeconds.basic.value], ['asc'])[0];

      let eowAgg = getAgg(EATER_OF_WORLDS);
      let eowNormal = getNormal(EATER_OF_WORLDS);
      let eowPrestige = getPrestige(EATER_OF_WORLDS);
      let eowFastest = orderBy(eowAgg.filter(p => p.startingPhaseIndex === 0), [p => p.entries[0].values.activityDurationSeconds.basic.value], ['asc'])[0];

      let sosAgg = getAgg(SPIRE_OF_STARS);
      let sosNormal = getNormal(SPIRE_OF_STARS);
      let sosPrestige = getPrestige(SPIRE_OF_STARS);
      let sosFastest = orderBy(sosAgg.filter(p => p.startingPhaseIndex === 0), [p => p.entries[0].values.activityDurationSeconds.basic.value], ['asc'])[0];

      let lwAgg = getAgg(LAST_WISH);
      let lwNormal = getNormal(LAST_WISH);
      let lwFlawless = getFlawless(LAST_WISH);
      let lwFastest = orderBy(lwAgg.filter(p => p.startingPhaseIndex === 0), [p => p.entries[0].values.activityDurationSeconds.basic.value], ['asc'])[0];

      let sotpAgg = getAgg(SCOURGE_OF_THE_PAST);
      let sotpNormal = getNormal(SCOURGE_OF_THE_PAST);
      let sotpFlawless = getFlawless(SCOURGE_OF_THE_PAST);
      let sotpFastest = orderBy(sotpAgg.filter(p => p.startingPhaseIndex === 0), [p => p.entries[0].values.activityDurationSeconds.basic.value], ['asc'])[0];
      firstSotpClear = orderBy(sotpAgg, [pgcr => pgcr.period], ['asc'])[0];

      raids.push({
        element: (
          <li key='SCOURGE_OF_THE_PAST'>
            <div className='name'>{SCOURGE_OF_THE_PAST.displayValue}</div>
            <div className='normal'>{sotpNormal.length}</div>
            <div className='prestige'>-</div>
            <div className='flawless'>{sotpFlawless.length}</div>
            <div className='fastest'>{sotpFastest ? sotpFastest.entries[0].values.activityDurationSeconds.basic.displayValue : `-`}</div>
          </li>
        )
      });

      raids.push({
        element: (
          <li key='LAST_WISH'>
            <div className='name'>{LAST_WISH.displayValue}</div>
            <div className='normal'>{lwNormal.length}</div>
            <div className='prestige'>-</div>
            <div className='flawless'>{lwFlawless.length}</div>
            <div className='fastest'>{lwFastest ? lwFastest.entries[0].values.activityDurationSeconds.basic.displayValue : `-`}</div>
          </li>
        )
      });

      raids.push({
        element: (
          <li key='SPIRE_OF_STARS'>
            <div className='name'>{SPIRE_OF_STARS.displayValue}</div>
            <div className='normal'>{sosNormal.length}</div>
            <div className='prestige'>{sosPrestige.length}</div>
            <div className='flawless'>-</div>
            <div className='fastest'>{sosFastest ? sosFastest.entries[0].values.activityDurationSeconds.basic.displayValue : `-`}</div>
          </li>
        )
      });

      raids.push({
        element: (
          <li key='EATER_OF_WORLDS'>
            <div className='name'>{EATER_OF_WORLDS.displayValue}</div>
            <div className='normal'>{eowNormal.length}</div>
            <div className='prestige'>{eowPrestige.length}</div>
            <div className='flawless'>-</div>
            <div className='fastest'>{eowFastest ? eowFastest.entries[0].values.activityDurationSeconds.basic.displayValue : `-`}</div>
          </li>
        )
      });

      raids.push({
        element: (
          <li key='LEVIATHAN'>
            <div className='name'>{LEVIATHAN.displayValue}</div>
            <div className='normal'>{levNormal.length}</div>
            <div className='prestige'>{levPrestige.length}</div>
            <div className='flawless'>-</div>
            <div className='fastest'>{levFastest ? levFastest.entries[0].values.activityDurationSeconds.basic.displayValue : `-`}</div>
          </li>
        )
      });

      // console.log(sotpAgg, firstSotpClear, sotpFastest);
    }

    return (
      <>
        <div className='bg' />
        <div className='first'>
          <ObservedImage className='image pgcrImage' src={SCOURGE_OF_THE_PAST.image} />
          <div className='head'>
            <div className='page-header'>
              <div className='name'>{t('Raids')}</div>
              <div className='description'>{t('Form a fireteam of six and brave the strange and powerful realms of our enemies')}</div>
            </div>
          </div>
          {firstSotpClear ? (
            <>
              <div className='properties'>
                <div className='desc'>First clear</div>
                <div className='name'>{SCOURGE_OF_THE_PAST.displayValue}</div>
                <div className='score'>
                  <Moment format='D/M/YYYY'>{firstSotpClear.period}</Moment>
                </div>
              </div>
              <div className='fireteam'>
                <div className='sub-header sub'>
                  <div>Fireteam</div>
                  <div>
                    <Moment format='D/M/YYYY'>{firstSotpClear.period}</Moment>
                  </div>
                </div>
                <ul className='list'>
                  {firstSotpClear.entries.map(entry => {
                    if (entry.values.completed.basic.value !== 1 || entry.values.completionReason.basic.value !== 0) {
                      return null;
                    }
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
        <div className='summary'>
          <div className='chart'>
            <ul className='list'>
              <li key='header'>
                <div className='name' />
                <div className='normal'>Normal</div>
                <div className='prestige'>Prestige</div>
                <div className='flawless'>Flawless</div>
                <div className='fastest'>Fastest</div>
              </li>
              {raids.map(r => r.element)}
            </ul>
          </div>
          <div className='datum'>
            <div className='d'>
              <div className='v'>{(aggregates.kills || 0).toLocaleString()}</div>
              <div className='n'>{t('kills')}</div>
            </div>
            <div className='d'>
              <div className='v'>{(aggregates.deaths || 0).toLocaleString()}</div>
              <div className='n'>{t('deaths')}</div>
            </div>
            <div className='d'>
              <div className='v'>{(aggregates.superKills || 0).toLocaleString()}</div>
              <div className='n'>{t('super kills')}</div>
            </div>
            <div className='d w'>
              <div className='v'>{Math.floor(parseInt(aggregates.timePlayed || 0) / 3600)}</div>
              <div className='n'>{Math.floor(parseInt(aggregates.timePlayed || 0) / 3600) === 1 ? t('hour played') : t('hours played')}</div>
            </div>
          </div>
          <div className='state'>{cacheLoading ? <Spinner mini /> : cacheState[4] !== raidReports.length ? <p>{cacheState[4] - raidReports.length} PGCRs failed to load at this minute therefore their stats are not included.</p> : null}</div>
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
)(RaidReport);
