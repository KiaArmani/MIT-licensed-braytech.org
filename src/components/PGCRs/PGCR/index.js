/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import { orderBy, groupBy } from 'lodash';
import moment from 'moment';
import Moment from 'react-moment';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import Button from '../../UI/Button';
import MemberLink from '../../MemberLink';
import * as bungie from '../../../utils/bungie';

import './styles.css';

class PGCR extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: [],
      playerCache: []
    };
  }

  expandHandler = instanceId => {
    this.setState((prevState, props) => {
      let index = prevState.expanded.find(e => e.instanceId === instanceId);
      if (!index) {
        let expanded = prevState.expanded.concat({ instanceId, expandedPlayers: [] });
        return { expanded: expanded };
      }
    });

    this.updatePlayerCache(instanceId);
  };

  contractHandler = instanceId => {
    this.setState((prevState, props) => {
      let index = prevState.expanded.find(e => e.instanceId === instanceId);
      if (index) {
        let expanded = prevState.expanded.filter(e => e.instanceId !== instanceId);
        return { expanded: expanded };
      }
    });
  };

  updatePlayerCache = instanceId => {
    let pgcr = this.props.data.find(p => instanceId === p.activityDetails.instanceId);

    if (pgcr) {
      pgcr.entries.forEach(async e => {
        let progression = await this.getProgression(e.player.destinyUserInfo.membershipType, e.player.destinyUserInfo.membershipId);

        this.setState((state, props) => ({
          playerCache: state.playerCache.concat({
            id: e.player.destinyUserInfo.membershipType + e.player.destinyUserInfo.membershipId,
            ...progression.points,
            ...progression.resets
          })
        }));
      });
    }
  };

  getProgression = async (membershipType, membershipId) => {
    let response = await bungie.memberProfile(membershipType, membershipId, '202,900');

    if (!response.characterProgressions.data) {
      return {
        points: {
          
        },
        resets: {
          
        }
      };
    }

    let gloryPoints = Object.values(response.characterProgressions.data)[0].progressions[2000925172].currentProgress.toLocaleString('en-us');
    let valorPoints = Object.values(response.characterProgressions.data)[0].progressions[2626549951].currentProgress.toLocaleString('en-us');
    let infamyPoints = Object.values(response.characterProgressions.data)[0].progressions[2772425241].currentProgress.toLocaleString('en-us');

    let valorResets = response.profileRecords.data.records[559943871] ? response.profileRecords.data.records[559943871].objectives[0].progress.toLocaleString('en-us') : '0';
    let infamyResets = response.profileRecords.data.records[3901785488] ? response.profileRecords.data.records[3901785488].objectives[0].progress.toLocaleString('en-us') : '0';

    return {
      points: {
        gloryPoints,
        valorPoints,
        infamyPoints
      },
      resets: {
        valorResets,
        infamyResets
      }
    };
  };

  togglePlayerHandler = (instanceId, characterId) => {
    this.setState((prevState, props) => {
      let expandedIndex = prevState.expanded.findIndex(e => e.instanceId === instanceId);

      if (expandedIndex > -1) {
        let index = prevState.expanded[expandedIndex].expandedPlayers.indexOf(characterId);
        if (index > -1) {
          let expanded = prevState.expanded;
          let expandedPlayers = expanded[expandedIndex].expandedPlayers.filter(c => c !== characterId);
          expanded[expandedIndex].expandedPlayers = expandedPlayers;
          return { expanded: expanded };
        } else {
          let expanded = prevState.expanded;
          let expandedPlayers = expanded[expandedIndex].expandedPlayers.concat(characterId);
          expanded[expandedIndex].expandedPlayers = expandedPlayers;
          return { expanded: expanded };
        }
      }
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.expanded !== this.state.expanded) {
      this.props.RebindTooltips();
    }
  }

  render() {
    const { t, member, data, limit } = this.props;
    const characters = member.data.profile.characters.data;
    const characterIds = characters.map(c => c.characterId);

    let reports = [];

    let modes = {
      crucible: [69, 70, 71, 72, 74, 73, 43, 44, 48, 60, 65, 59, 31, 37, 38],
      clash: [71, 72, 44],
      control: [73, 74, 43],
      ironBanner: [43, 44],
      supremacy: [31],
      survival: [37],
      countdown: [38],
      gambit: [63, 75]
    };

    data.forEach(pgcr => {
      let isExpanded = this.state.expanded.find(e => e.instanceId === pgcr.activityDetails.instanceId);

       if (isExpanded) console.log(pgcr);

      let definitionMode = Object.values(manifest.DestinyActivityModeDefinition).find(d => d.modeType === pgcr.activityDetails.mode);

      let definitionCompetitive = manifest.DestinyActivityDefinition[2947109551];
      let definitionQuickplay = manifest.DestinyActivityDefinition[2274172949];
      let definitionStrikes = manifest.DestinyActivityModeDefinition[2394616003];

      let modeName = definitionMode.displayProperties.name;
      modeName = definitionMode.hash === 2096553452 ? 'Lockdown' : modeName;
      modeName = modeName.replace(': ' + definitionCompetitive.displayProperties.name, '');
      modeName = modeName.replace(': ' + definitionQuickplay.displayProperties.name, '');
      modeName = modeName.replace(definitionStrikes.displayProperties.name, '').trim();

      let map = manifest.DestinyActivityDefinition[pgcr.activityDetails.referenceId];

      let entry = pgcr.entries.find(entry => characterIds.includes(entry.characterId));

      let standing = entry.values.standing && entry.values.standing.basic.value !== undefined ? entry.values.standing.basic.value : -1;

      let standingImage, alphaVictory, bravoVictory;

      if (standing > -1) {
        alphaVictory = pgcr.teams.find(t => t.teamId === 17 && t.standing.basic.value === 0);
        bravoVictory = pgcr.teams.find(t => t.teamId === 18 && t.standing.basic.value === 0);

        if (modes.crucible.includes(pgcr.activityDetails.mode)) {
          standingImage = !standing ? `/static/images/extracts/ui/01E3-000004AC.PNG` : `/static/images/extracts/ui/01E3-000004B2.PNG`;
        }
        if (modes.ironBanner.includes(pgcr.activityDetails.mode)) {
          standingImage = !standing ? `/static/images/extracts/ui/0560-000006CB.PNG` : `/static/images/extracts/ui/0560-000006C8.PNG`;
        }
        if (modes.gambit.includes(pgcr.activityDetails.mode)) {
          standingImage = !standing ? `/static/images/extracts/ui/02AF-00001F1E.PNG` : `/static/images/extracts/ui/02AF-00001F1A.PNG`;
        }
      }

      let row, detail;

      let realEndTime = moment(pgcr.period).add(entry.values.activityDurationSeconds.basic.value, 'seconds');

      row = (
        <div className='basic'>
          <div className='mode'>{modeName}</div>
          <div className='map'>{map.displayProperties.name}</div>
          <div className='ago'>
            <Moment fromNow>{realEndTime}</Moment>
          </div>
        </div>
      );

      let displayStatsDefault = {
        header: [
          {
            key: 'opponentsDefeated',
            name: 'Kills + assists',
            abbr: 'KA',
            type: 'value'
          },
          {
            key: 'kills',
            name: 'Kills',
            abbr: 'K',
            type: 'value'
          },
          {
            key: 'deaths',
            name: 'Deaths',
            abbr: 'D',
            type: 'value'
          },
          {
            key: 'killsDeathsRatio',
            name: 'K/D',
            abbr: 'KD',
            type: 'value',
            round: true
          }
        ],
        expanded: [
          {
            name: 'Common',
            fields: [
              {
                key: 'weapons',
                name: 'Weapons used'
              }
            ]
          },
          {
            name: 'Basic',
            fields: [
              {
                key: 'kills',
                name: 'Kills',
                type: 'value'
              },
              {
                key: 'assists',
                name: 'Assists',
                type: 'value'
              },
              {
                key: 'deaths',
                name: 'Deaths',
                abbr: 'D',
                type: 'value'
              },
              {
                key: 'killsDeathsRatio',
                name: 'K/D',
                type: 'value',
                round: true
              }
            ]
          },
          {
            name: 'Extra',
            fields: [
              {
                key: 'precisionKills',
                name: 'Precision kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsSuper',
                name: 'Super kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsGrenade',
                name: 'Grenade kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsMelee',
                name: 'Melee kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsAbility',
                name: 'Ability kills',
                type: 'value',
                extended: true
              }
            ]
          }
        ]
      };

      let displayStatsCrucible = {
        header: [
          {
            key: 'opponentsDefeated',
            name: 'Kills + assists',
            abbr: 'KA',
            type: 'value'
          },
          {
            key: 'kills',
            name: 'Kills',
            abbr: 'K',
            type: 'value'
          },
          {
            key: 'deaths',
            name: 'Deaths',
            abbr: 'D',
            type: 'value'
          },
          {
            key: 'killsDeathsRatio',
            name: 'K/D',
            abbr: 'KD',
            type: 'value',
            round: true
          },
          {
            key: 'gloryPoints',
            name: 'Glory points',
            abbr: 'G',
            type: 'value',
            async: true,
            hideInline: true
          }
        ],
        expanded: [
          {
            name: 'Common',
            fields: [
              {
                key: 'gloryPoints',
                name: 'Glory points',
                type: 'value',
                async: true
              },
              {
                key: 'valorResets',
                name: 'Valor resets',
                type: 'value',
                async: true
              },
              {
                key: 'weapons',
                name: 'Weapons used'
              }
            ]
          },
          {
            name: 'Basic',
            fields: [
              {
                key: 'kills',
                name: 'Kills',
                type: 'value'
              },
              {
                key: 'assists',
                name: 'Assists',
                type: 'value'
              },
              {
                key: 'deaths',
                name: 'Deaths',
                abbr: 'D',
                type: 'value'
              },
              {
                key: 'killsDeathsRatio',
                name: 'K/D',
                type: 'value',
                round: true
              }
            ]
          },
          {
            name: 'Extra',
            fields: [
              {
                key: 'precisionKills',
                name: 'Precision kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsSuper',
                name: 'Super kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsGrenade',
                name: 'Grenade kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsMelee',
                name: 'Melee kills',
                type: 'value',
                extended: true
              },
              {
                key: 'weaponKillsAbility',
                name: 'Ability kills',
                type: 'value',
                extended: true
              }
            ]
          }
        ]
      };

      let displayStatsGambit = {
        header: [
          {
            key: 'mobKills',
            name: 'Mob Kills',
            abbr: 'MK',
            type: 'value',
            extended: true
          },
          {
            key: 'motesDeposited',
            name: 'Motes Deposited',
            abbr: 'MD',
            type: 'value',
            extended: true
          },
          {
            key: 'motesLost',
            name: 'Motes Lost',
            abbr: 'ML',
            type: 'value',
            extended: true
          },
          {
            key: 'invasionKills',
            name: 'Invasion Kills',
            abbr: 'IK',
            type: 'value',
            extended: true
          },
          {
            key: 'blockerKills',
            name: 'Blocker Kills',
            type: 'value',
            extended: true,
            hideInline: true
          }
        ],
        expanded: [
          {
            name: 'Common',
            fields: [
              {
                key: 'infamyPoints',
                name: 'Infamy points',
                type: 'value',
                async: true
              },
              {
                key: 'infamyResets',
                name: 'Infamy resets',
                type: 'value',
                async: true
              },
              {
                key: 'weapons',
                name: 'Weapons used'
              }
            ]
          },
          {
            name: 'Mobs',
            fields: [
              {
                key: 'mobKills',
                name: 'Mob Kills',
                type: 'value',
                extended: true
              },
              {
                key: 'highValueKills',
                name: 'High Value Killed',
                type: 'value',
                extended: true
              },
              {
                key: 'blockerKills',
                name: 'Blocker Kills',
                type: 'value',
                extended: true
              },
              {
                key: 'smallBlockersSent',
                name: 'Small Blockers Sent',
                type: 'value',
                extended: true
              },
              {
                key: 'mediumBlockersSent',
                name: 'Medium Blockers Sent',
                type: 'value',
                extended: true
              },
              {
                key: 'largeBlockersSent',
                name: 'Large Blockers Sent',
                type: 'value',
                extended: true
              }
            ]
          },
          {
            name: 'Motes',
            fields: [
              {
                key: 'motesDeposited',
                name: 'Motes Deposited',
                type: 'value',
                extended: true
              },
              {
                key: 'motesLost',
                name: 'Motes Lost',
                type: 'value',
                extended: true
              },
              {
                key: 'motesDenied',
                name: 'Motes Denied',
                type: 'value',
                extended: true
              }
            ]
          },
          {
            name: 'Invasion',
            fields: [
              {
                key: 'invasions',
                name: 'Invasions',
                type: 'value',
                extended: true
              },
              {
                key: 'invasionKills',
                name: 'Invasion Kills',
                type: 'value',
                extended: true
              },
              {
                key: 'invasionDeaths',
                name: 'Invasion Deaths',
                type: 'value',
                extended: true
              },
              {
                key: 'invaderKills',
                name: 'Invader Kills',
                type: 'value',
                extended: true
              },
              {
                key: 'invaderDeaths',
                name: 'Invader Deaths',
                type: 'value',
                extended: true
              }
            ]
          }
        ]
      };

      let displayStats;
      if (modes.gambit.includes(pgcr.activityDetails.mode)) {
        displayStats = displayStatsGambit;
      } else if (modes.crucible.includes(pgcr.activityDetails.mode)) {
        displayStats = displayStatsCrucible;
      } else {
        displayStats = displayStatsDefault;
      }

      let entries = [];
      pgcr.entries.forEach(entry => {
        let dnf = entry.values.completed.basic.value === 0 ? true : false;
        let isExpandedPlayer = this.state.expanded.find(e => e.instanceId === pgcr.activityDetails.instanceId && e.expandedPlayers.includes(entry.characterId));

        entries.push({
          teamId: pgcr.teams && pgcr.teams.length ? entry.values.team.basic.value : null,
          fireteamId: entry.values.fireteamId ? entry.values.fireteamId.basic.value : null,
          element: (
            <li key={entry.characterId} className={cx('linked', { isExpandedPlayer })} onClick={() => this.togglePlayerHandler(pgcr.activityDetails.instanceId, entry.characterId)}>
              <div className={cx('inline', { dnf: dnf })}>
                <div className='member'>
                  <MemberLink type={entry.player.destinyUserInfo.membershipType} id={entry.player.destinyUserInfo.membershipId} displayName={entry.player.destinyUserInfo.displayName} characterId={entry.characterId} />
                </div>
                {displayStats.header.map((s, i) => {
                  let value;

                  if (s.extended) {
                    value = s.round ? Number.parseFloat(entry.extended.values[s.key].basic[s.type]).toFixed(2) : entry.extended.values[s.key].basic[s.type];
                  } else if (s.async) {
                    let playerCache = this.state.playerCache.find(c => c.id === entry.player.destinyUserInfo.membershipType + entry.player.destinyUserInfo.membershipId);
                    value = playerCache && playerCache[s.key] ? playerCache[s.key] : '–';
                  } else {
                    value = s.round ? Number.parseFloat(entry.values[s.key].basic[s.type]).toFixed(2) : entry.values[s.key].basic[s.type];
                  }

                  return (
                    <div key={i} className={cx('stat', { hideInline: s.hideInline, extended: s.extended }, s.key)}>
                      {s.expanded ? <div className='name'>{s.name}</div> : null}
                      <div className='value'>{value}</div>
                    </div>
                  );
                })}
              </div>
              <div className='expanded'>
                {displayStats.expanded.map((g, h) => {
                  return (
                    <div key={h} className='group'>
                      {g.name ? (
                        <div className='sub-header alt'>
                          <div>{g.name}</div>
                        </div>
                      ) : null}
                      {g.fields.map((s, i) => {
                        let value;
                        if (s.extended) {
                          value = s.round ? Number.parseFloat(entry.extended.values[s.key].basic[s.type]).toFixed(2) : entry.extended.values[s.key].basic[s.type].toLocaleString('en-us');
                        } else if (s.async) {
                          let playerCache = this.state.playerCache.find(c => c.id === entry.player.destinyUserInfo.membershipType + entry.player.destinyUserInfo.membershipId);
                          value = playerCache && playerCache[s.key] ? playerCache[s.key] : '–';
                        } else if (s.key === 'weapons') {
                          if (entry.extended.weapons && entry.extended.weapons.length) {
                            value = (
                              <ul>
                                {entry.extended.weapons.map((w, p) => {
                                  let definitionItem = manifest.DestinyInventoryItemDefinition[w.referenceId];
                                  let kills = w.values ? w.values.uniqueWeaponKills.basic.value : '0';
                                  return (
                                    <li key={p} className={cx('item', 'tooltip')} data-itemhash={definitionItem.hash} data-rollnote='yes'>
                                      <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${definitionItem.displayProperties.icon}`} />
                                      <div className='kills'>{kills}</div>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          } else {
                            return null;
                          }
                        } else {
                          value = s.round ? Number.parseFloat(entry.values[s.key].basic[s.type]).toFixed(2) : entry.values[s.key].basic[s.type].toLocaleString('en-us');
                        }

                        return (
                          <div key={i} className={cx('stat', { hideInline: s.hideInline }, s.key)}>
                            <div className='name'>{s.name}</div>
                            <div className='value'>{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </li>
          )
        });
      });

      let alpha = pgcr.teams && pgcr.teams.length ? pgcr.teams.find(t => t.teamId === 17) : false;
      let bravo = pgcr.teams && pgcr.teams.length ? pgcr.teams.find(t => t.teamId === 18) : false;
      let score;
      if (pgcr.teams && pgcr.teams.length && alpha && bravo) {
        score = (
          <>
            <div className={cx('value', 'alpha', { victory: alphaVictory })}>{alpha.score.basic.displayValue}</div>
            <div className={cx('value', 'bravo', { victory: bravoVictory })}>{bravo.score.basic.displayValue}</div>
          </>
        );
      }

      detail = (
        <>
          <div className='head'>
            <ObservedImage className='image bg' src={`https://www.bungie.net${map.pgcrImage}`} />
            <div className='detail'>
              <div>
                <div className='mode'>{modeName}</div>
                <div className='map'>{map.displayProperties.name}</div>
              </div>
              <div>
                <div className='duration'>{entry.values.activityDurationSeconds.basic.displayValue}</div>
                <div className='ago'>
                  <Moment fromNow>{realEndTime}</Moment>
                </div>
              </div>
            </div>
            {standing > -1 ? (
              <>
                <div className='standing'>
                  {standingImage ? <ObservedImage className='image' src={standingImage} /> : null}
                  <div className='text'>{standing === 0 ? `VICTORY` : `DEFEAT`}</div>
                </div>
                <div className='score'>{score}</div>
              </>
            ) : null}
          </div>
          <div className='entries'>
            {pgcr.teams && pgcr.teams.length ? (
              orderBy(pgcr.teams, [t => t.score.basic.value], ['desc']).map(t => {
                let fireteams = Object.values(groupBy(entries.filter(e => e.teamId === t.teamId), 'fireteamId'));

                return (
                  <ul key={t.teamId} className='team'>
                    <li className={cx('team-head', (t.teamId === 17 ? 'Alpha' : 'Bravo').toLowerCase())}>
                      <div className='team name'>{t.teamId === 17 ? 'Alpha' : 'Bravo'} team</div>
                      {displayStats.header.map((s, i) => {
                        return (
                          <div key={i} className={cx(s.key, { hideInline: s.hideInline })}>
                            <div className='full'>{s.name}</div>
                            <div className='abbr'>{s.abbr}</div>
                          </div>
                        );
                      })}
                      <div className='team score hideInline'>{t.score.basic.displayValue}</div>
                    </li>
                    {fireteams.map((f, i) => {
                      return (
                        <li key={i}>
                          <ul className={cx('list', 'fireteam', { stacked: f.length > 1 })}>{f.map(e => e.element)}</ul>
                        </li>
                      );
                    })}
                  </ul>
                );
              })
            ) : (
              <ul key={t.teamId} className='team'>
                <li className={cx('team-head')}>
                  <div className='team name' />
                  {displayStats.header.map((s, i) => {
                    return (
                      <div key={i} className={cx(s.key, { hideInline: s.hideInline })}>
                        <div className='full'>{s.name}</div>
                        <div className='abbr'>{s.abbr}</div>
                      </div>
                    );
                  })}
                  <div className='team score hideInline' />
                </li>
                {Object.values(groupBy(entries, 'fireteamId')).map((f, i) => {
                  return (
                    <li key={i}>
                      <ul className={cx('list', 'fireteam', { stacked: f.length > 1 })}>{f.map(e => e.element)}</ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className='sticky-nav inline'>
            <div />
            <ul>
              <li>
                <Button action={() => this.contractHandler(pgcr.activityDetails.instanceId)}>
                  <i className='destiny-B_Button' />
                  {t('Close')}
                </Button>
              </li>
            </ul>
          </div>
        </>
      );

      reports.push({
        element: (
          <li key={pgcr.activityDetails.instanceId} className={cx('linked', { isExpanded: isExpanded, standing: standing > -1, victory: standing === 0 })} onClick={() => (!isExpanded ? this.expandHandler(pgcr.activityDetails.instanceId) : false)}>
            {!isExpanded ? row : detail}
          </li>
        )
      });
    });

    return <ul className='list reports'>{reports.slice(0, limit).map(r => r.element)}</ul>;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(PGCR);
