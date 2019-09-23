import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';
import moment from 'moment';
import Globals from '../../utils/globals';
import assign from 'lodash/assign';
import orderBy from 'lodash/orderBy';
import ObservedImage from '../../components/ObservedImage';
import Spinner from '../../components/UI/Spinner';
import manifest from '../../utils/manifest';

import './stats.css';
import { withNamespaces } from 'react-i18next';

class StatsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      membersResponse: false,
      processMembers: false,
      members: []
    };

    this.groupFetch = this.groupFetch.bind(this);
    this.ProfileResponse = this.ProfileResponse.bind(this);
    this.processMembers = this.processMembers.bind(this);
  }

  ProfileResponse = async member => {
    let requests = [
      {
        name: 'profile',
        path: `https://www.bungie.net/Platform/Destiny2/${member.destinyUserInfo.membershipType}/Profile/${member.destinyUserInfo.membershipId}/?components=100,200,202,204,900`
      },
      {
        name: 'stats',
        path: `https://www.bungie.net/Platform/Destiny2/${member.destinyUserInfo.membershipType}/Account/${member.destinyUserInfo.membershipId}/Character/0/Stats/?groups=1,3&modes=3,4,5,6,7,16,19,63&periodType=0`
      }
    ];

    let fetches = requests.map(async request => {
      const get = await fetch(request.path, {
        headers: {
          'X-API-Key': Globals.key.bungie
        }
      });
      const response = await get.json();
      let object = {};
      object[request.name] = response;
      return object;
    });

    try {
      const promises = await Promise.all(fetches);
      let result = assign(...promises);
      result.member = member;
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  groupFetch = async groupId => {
    let requests = [
      {
        name: 'members',
        path: `https://www.bungie.net/Platform/GroupV2/${groupId}/Members/`
      },
      {
        name: 'weeklyRewardState',
        path: `https://www.bungie.net/Platform/Destiny2/Clan/${groupId}/WeeklyRewardState/`
      }
    ];

    let fetches = requests.map(request => {
      return fetch(request.path, {
        headers: {
          'X-API-Key': Globals.key.bungie
        }
      })
        .then(response => {
          return response.json();
        })
        .then(fetch => {
          let object = {};
          object[request.name] = fetch;
          return object;
        });
    });

    return Promise.all(fetches)
      .then(promises => {
        return assign(...promises);
      })
      .catch(error => {
        console.log(error);
      });
  };

  processMembers = () => {
    if (!this.state.processMembers) {
      this.setState({
        processMembers: true
      });
      this.state.membersResponse.Response.results.forEach(member => {
        this.ProfileResponse(member)
          .then(response => {
            if (response.profile && response.profile.ErrorCode !== 1) {
              console.warn(member.destinyUserInfo.membershipType + '/' + member.destinyUserInfo.membershipId + ' - ' + response.profile.Message);
              return;
            }
            if (response.stats && response.stats.ErrorCode !== 1) {
              console.warn(member.destinyUserInfo.membershipType + '/' + member.destinyUserInfo.membershipId + ' - ' + response.stats.Message);
              return;
            }

            if (response.profile) {
              response.profile.Response.characters.data = Object.values(response.profile.Response.characters.data).sort(function(a, b) {
                return parseInt(b.minutesPlayedTotal) - parseInt(a.minutesPlayedTotal);
              });
            }

            if (response.stats) {
              response = {
                member: response.member,
                profile: response.profile.Response,
                stats: response.stats.Response
              };
            } else {
              response = {
                member: response.member,
                profile: response.profile.Response
              };
            }

            this.setState(prevState => ({
              members: [...prevState.members, response]
            }));
          })
          .catch(error => {
            console.log(error);
          });
      });
    }
  };

  componentDidMount() {
    const groups = this.props.profile.data.groups;
    const clan = groups.results.length > 0 ? groups.results[0].group : false;

    window.scrollTo(0, 0);

    if (clan) {
      this.groupFetch(clan.groupId).then(response => {
        if (response.members.ErrorCode === 1) {
          this.setState({
            membersResponse: response.members
          });
          this.processMembers();
        }
      });
    }
  }

  render() {
    const { t } = this.props;
    const groups = this.props.profile.data.groups;
    const clan = groups.results.length > 0 ? groups.results[0].group : false;

    let collation = null;
    if (this.state.members.length > 0) {
      let raw = this.state.members.map(member => ({
        membershipId: member.member.destinyUserInfo.membershipId,
        allPvE: member.stats.allPvE.allTime,
        allPvP: member.stats.allPvP.allTime,
        ironBanner: member.stats.ironBanner.allTime,
        gambit: member.stats.pvecomp_gambit.allTime,
        nightfalls: member.stats.nightfall.allTime,
        strikes: member.stats.strike.allTime,
        raids: member.stats.raid.allTime,
        patrol: member.stats.patrol.allTime
      }));

      let stats = {
        allPvE: raw.map(member => member.allPvE),
        allPvP: raw.map(member => member.allPvP),
        ironBanner: raw.map(member => member.ironBanner),
        gambit: raw.map(member => member.gambit),
        nightfalls: raw.map(member => member.nightfalls),
        strikes: raw.map(member => member.strikes),
        raids: raw.map(member => member.raids),
        patrol: raw.map(member => member.patrol)
      };

      Object.keys(stats).forEach(rootKey => {
        Object.keys(stats[rootKey]).forEach(childKey => stats[rootKey][childKey] === undefined && delete stats[rootKey][childKey]);
      });

      console.log(this.state.members, stats);

      let collated = {
        allPvE: {
          secondsPlayed: {
            value: stats.allPvE.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, secondsPlayed: member.allPvE ? member.allPvE.secondsPlayed.basic.value : false };
            })
          },
          kills: {
            value: stats.allPvE.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.allPvE ? member.allPvE.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.allPvE.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.allPvE ? member.allPvE.deaths.basic.value : false };
            })
          },
          killsDeathsRatio: {
            value: Number(
              stats.allPvE.reduce((sum, member) => {
                return sum + member.killsDeathsRatio.basic.value;
              }, 0) / stats.allPvE.length
            ).toFixed(2),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.killsDeathsRatio.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, killsDeathsRatio: member.allPvE ? member.allPvE.killsDeathsRatio.basic.value : false };
            })
          },
          orbsDropped: {
            value: stats.allPvE.reduce((sum, member) => {
              return sum + member.orbsDropped.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.orbsDropped.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, orbsDropped: member.allPvE ? member.allPvE.orbsDropped.basic.value : false };
            })
          },
          publicEvents: {
            value: stats.allPvE.reduce((sum, member) => {
              return sum + member.publicEventsCompleted.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.publicEventsCompleted.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, publicEvents: member.allPvE ? member.allPvE.publicEventsCompleted.basic.value : false };
            })
          },
          adventures: {
            value: stats.allPvE.reduce((sum, member) => {
              return sum + member.adventuresCompleted.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvE ? member.allPvE.adventuresCompleted.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, adventures: member.allPvE ? member.allPvE.adventuresCompleted.basic.value : false };
            })
          }
        },
        allPvP: {
          secondsPlayed: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, secondsPlayed: member.allPvP ? member.allPvP.secondsPlayed.basic.value : false };
            })
          },
          kills: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.allPvP ? member.allPvP.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.allPvP ? member.allPvP.deaths.basic.value : false };
            })
          },
          bestSingleGameKills: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.bestSingleGameKills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.bestSingleGameKills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, bestSingleGameKills: member.allPvP ? member.allPvP.bestSingleGameKills.basic.value : false };
            })
          },
          killsDeathsRatio: {
            value: Number(
              stats.allPvP.reduce((sum, member) => {
                return sum + member.killsDeathsRatio.basic.value;
              }, 0) / stats.allPvP.length
            ).toFixed(2),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.killsDeathsRatio.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, killsDeathsRatio: member.allPvP ? member.allPvP.killsDeathsRatio.basic.value : false };
            })
          },
          winRatio: {
            value:
              stats.allPvP.reduce((sum, member) => {
                return sum + member.activitiesWon.basic.value;
              }, 0) /
              stats.allPvP.reduce((sum, member) => {
                return sum + member.activitiesEntered.basic.value;
              }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.activitiesWon.basic.value / member.allPvP.activitiesEntered.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, winRatio: member.allPvP ? member.allPvP.activitiesWon.basic.value / member.allPvP.activitiesEntered.basic.value : false };
            })
          },
          medalStreak7x: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.medalStreak7x.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.medalStreak7x.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medalStreak7x: member.allPvP ? member.allPvP.medalStreak7x.basic.value : false };
            })
          },
          medalStreakAbsurd: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.medalStreakAbsurd.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.medalStreakAbsurd.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medalStreakAbsurd: member.allPvP ? member.allPvP.medalStreakAbsurd.basic.value : false };
            })
          },
          medalAbilityVoidwalkerDistance: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.medalAbilityVoidwalkerDistance.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.medalAbilityVoidwalkerDistance.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medalAbilityVoidwalkerDistance: member.allPvP ? member.allPvP.medalAbilityVoidwalkerDistance.basic.value : false };
            })
          }
        },
        ironBanner: {
          secondsPlayed: {
            value: stats.ironBanner.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.ironBanner ? member.ironBanner.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, secondsPlayed: member.ironBanner ? member.ironBanner.secondsPlayed.basic.value : false };
            })
          },
          kills: {
            value: stats.ironBanner.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.ironBanner ? member.ironBanner.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.ironBanner ? member.ironBanner.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.ironBanner.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.ironBanner ? member.ironBanner.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.ironBanner ? member.ironBanner.deaths.basic.value : false };
            })
          },
          bestSingleGameKills: {
            value: stats.ironBanner.reduce((sum, member) => {
              return sum + member.bestSingleGameKills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.ironBanner ? member.ironBanner.bestSingleGameKills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, bestSingleGameKills: member.ironBanner ? member.ironBanner.bestSingleGameKills.basic.value : false };
            })
          },
          killsDeathsRatio: {
            value: Number(
              stats.ironBanner.reduce((sum, member) => {
                return sum + member.killsDeathsRatio.basic.value;
              }, 0) / stats.ironBanner.length
            ).toFixed(2),
            ordered: orderBy(raw, [member => (member.ironBanner ? member.ironBanner.killsDeathsRatio.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, killsDeathsRatio: member.ironBanner ? member.ironBanner.killsDeathsRatio.basic.value : false };
            })
          },
          winRatio: {
            value:
              stats.ironBanner.reduce((sum, member) => {
                return sum + member.activitiesWon.basic.value;
              }, 0) /
              stats.ironBanner.reduce((sum, member) => {
                return sum + member.activitiesEntered.basic.value;
              }, 0),
            ordered: orderBy(raw, [member => (member.ironBanner ? member.ironBanner.activitiesWon.basic.value / member.ironBanner.activitiesEntered.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, winRatio: member.ironBanner ? member.ironBanner.activitiesWon.basic.value / member.ironBanner.activitiesEntered.basic.value : false };
            })
          },
          medalStreak7x: {
            value: stats.allPvP.reduce((sum, member) => {
              return sum + member.medalStreak7x.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.allPvP ? member.allPvP.medalStreak7x.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medalStreak7x: member.allPvP ? member.allPvP.medalStreak7x.basic.value : false };
            })
          }
        },
        strikes: {
          secondsPlayed: {
            value: stats.strikes.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.strikes ? member.strikes.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, secondsPlayed: member.strikes ? member.strikes.secondsPlayed.basic.value : false };
            })
          },
          kills: {
            value: stats.strikes.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.strikes ? member.strikes.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.strikes ? member.strikes.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.strikes.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.strikes ? member.strikes.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.strikes ? member.strikes.deaths.basic.value : false };
            })
          },
          orbsDropped: {
            value: stats.strikes.reduce((sum, member) => {
              return sum + member.orbsDropped.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.strikes ? member.strikes.orbsDropped.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, orbsDropped: member.strikes ? member.strikes.orbsDropped.basic.value : false };
            })
          },
          activitiesCleared: {
            value: stats.strikes.reduce((sum, member) => {
              return sum + member.activitiesCleared.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.strikes ? member.strikes.activitiesCleared.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, activitiesCleared: member.strikes ? member.strikes.activitiesCleared.basic.value : false };
            })
          }
        },
        nightfalls: {
          secondsPlayed: {
            value: stats.nightfalls.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.nightfalls ? member.nightfalls.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, activitiesCleared: member.nightfalls ? member.nightfalls.activitiesCleared.basic.value : false };
            })
          },
          kills: {
            value: stats.nightfalls.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.nightfalls ? member.nightfalls.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.nightfalls ? member.nightfalls.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.nightfalls.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.nightfalls ? member.nightfalls.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.nightfalls ? member.nightfalls.deaths.basic.value : false };
            })
          },
          orbsDropped: {
            value: stats.nightfalls.reduce((sum, member) => {
              return sum + member.orbsDropped.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.nightfalls ? member.nightfalls.orbsDropped.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, orbsDropped: member.nightfalls ? member.nightfalls.orbsDropped.basic.value : false };
            })
          },
          activitiesCleared: {
            value: stats.nightfalls.reduce((sum, member) => {
              return sum + member.activitiesCleared.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.nightfalls ? member.nightfalls.activitiesCleared.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, activitiesCleared: member.nightfalls ? member.nightfalls.activitiesCleared.basic.value : false };
            })
          }
        },
        raids: {
          secondsPlayed: {
            value: stats.raids.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.raids ? member.raids.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, secondsPlayed: member.raids ? member.raids.secondsPlayed.basic.value : false };
            })
          },
          kills: {
            value: stats.raids.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.raids ? member.raids.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.raids ? member.raids.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.raids.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.raids ? member.raids.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.raids ? member.raids.deaths.basic.value : false };
            })
          },
          suicides: {
            value: stats.raids.reduce((sum, member) => {
              return sum + member.suicides.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.raids ? member.raids.suicides.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, suicides: member.raids ? member.raids.suicides.basic.value : false };
            })
          },
          orbsDropped: {
            value: stats.raids.reduce((sum, member) => {
              return sum + member.orbsDropped.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.raids ? member.raids.orbsDropped.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, orbsDropped: member.raids ? member.raids.orbsDropped.basic.value : false };
            })
          },
          activitiesCleared: {
            value: stats.raids.reduce((sum, member) => {
              return sum + member.activitiesCleared.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.raids ? member.raids.activitiesCleared.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, activitiesCleared: member.raids ? member.raids.activitiesCleared.basic.value : false };
            })
          }
        },
        gambit: {
          secondsPlayed: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.secondsPlayed.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.secondsPlayed.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, secondsPlayed: member.gambit ? member.gambit.secondsPlayed.basic.value : false };
            })
          },
          kills: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.kills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.kills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, kills: member.gambit ? member.gambit.kills.basic.value : false };
            })
          },
          deaths: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.deaths.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.deaths.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, deaths: member.gambit ? member.gambit.deaths.basic.value : false };
            })
          },
          killsDeathsRatio: {
            value: Number(
              stats.gambit.reduce((sum, member) => {
                return sum + member.killsDeathsRatio.basic.value;
              }, 0) / stats.gambit.length
            ).toFixed(2),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.killsDeathsRatio.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, killsDeathsRatio: member.gambit ? member.gambit.killsDeathsRatio.basic.value : false };
            })
          },
          orbsDropped: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.orbsDropped.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.orbsDropped.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, orbsDropped: member.gambit ? member.gambit.orbsDropped.basic.value : false };
            })
          },
          winRatio: {
            value:
              stats.gambit.reduce((sum, member) => {
                return sum + member.activitiesWon.basic.value;
              }, 0) /
              stats.gambit.reduce((sum, member) => {
                return sum + member.activitiesEntered.basic.value;
              }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.activitiesWon.basic.value / member.gambit.activitiesEntered.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, winRatio: member.gambit ? member.gambit.activitiesWon.basic.value / member.gambit.activitiesEntered.basic.value : false };
            })
          },
          motesDeposited: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.motesDeposited.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.motesDeposited.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, motesDeposited: member.gambit ? member.gambit.motesDeposited.basic.value : false };
            })
          },
          motesLost: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.motesLost.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.motesLost.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, motesLost: member.gambit ? member.gambit.motesLost.basic.value : false };
            })
          },
          motesDenied: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.motesDenied.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.motesDenied.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, motesDenied: member.gambit ? member.gambit.motesDenied.basic.value : false };
            })
          },
          blockerKills: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.blockerKills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.blockerKills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, blockerKills: member.gambit ? member.gambit.blockerKills.basic.value : false };
            })
          },
          primevalDamage: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.primevalDamage.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.primevalDamage.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, primevalDamage: member.gambit ? member.gambit.primevalDamage.basic.value : false };
            })
          },
          invasionKills: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.invasionKills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.invasionKills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, invasionKills: member.gambit ? member.gambit.invasionKills.basic.value : false };
            })
          },
          invaderKills: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.invaderKills.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.invaderKills.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, invaderKills: member.gambit ? member.gambit.invaderKills.basic.value : false };
            })
          },
          medals_pvecomp_medal_overkillmonger: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.medals_pvecomp_medal_overkillmonger.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.medals_pvecomp_medal_overkillmonger.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medals_pvecomp_medal_overkillmonger: member.gambit ? member.gambit.medals_pvecomp_medal_overkillmonger.basic.value : false };
            })
          },
          medals_pvecomp_medal_invader_kill_four: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.medals_pvecomp_medal_invader_kill_four.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.medals_pvecomp_medal_invader_kill_four.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medals_pvecomp_medal_invader_kill_four: member.gambit ? member.gambit.medals_pvecomp_medal_invader_kill_four.basic.value : false };
            })
          },
          medals_pvecomp_medal_tags_denied_15: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.medals_pvecomp_medal_tags_denied_15.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.medals_pvecomp_medal_tags_denied_15.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medals_pvecomp_medal_tags_denied_15: member.gambit ? member.gambit.medals_pvecomp_medal_tags_denied_15.basic.value : false };
            })
          },
          medals_pvecomp_medal_fast_fill: {
            value: stats.gambit.reduce((sum, member) => {
              return sum + member.medals_pvecomp_medal_fast_fill.basic.value;
            }, 0),
            ordered: orderBy(raw, [member => (member.gambit ? member.gambit.medals_pvecomp_medal_fast_fill.basic.value : false)], ['desc']).map(member => {
              return { membershipId: member.membershipId, medals_pvecomp_medal_fast_fill: member.gambit ? member.gambit.medals_pvecomp_medal_fast_fill.basic.value : false };
            })
          }
        }
      };

      // console.log(collated);

      const getTopThree = leaderboard => {
        return leaderboard.slice(0, 5).map(rank => {
          let member = this.state.members.find(member => member.member.destinyUserInfo.membershipId === rank.membershipId);

          // if (!member.profile.characterActivities.data) {
          //   return null;
          // }

          // let lastCharacterActivity = Object.entries(member.profile.characterActivities.data);
          // lastCharacterActivity = orderBy(lastCharacterActivity, [character => character[1].dateActivityStarted], ['desc']);

          // lastCharacterActivity = lastCharacterActivity.length > 0 ? lastCharacterActivity[0] : false;

          // let lastCharacterTime = Object.entries(member.profile.characterActivities.data);
          // lastCharacterTime = orderBy(lastCharacterTime, [character => character[1].dateActivityStarted], ['desc']);

          // let lastCharacterId = lastCharacterActivity ? lastCharacterActivity[0] : lastCharacterTime[0];
          // let lastCharacter = member.profile.characters.data.find(character => character.characterId === lastCharacterId);

          // <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${lastCharacter.emblemPath}`} />

          let keys = Object.keys(rank);
          if (!rank[keys[1]]) {
            return null;
          }

          let stat;
          if (keys[1] === 'secondsPlayed') {
            stat = (
              <>
                {Math.ceil(moment.duration(rank[keys[1]], 'seconds').as('days'))} {t('days')}
              </>
            );
          } else if (keys[1] === 'killsDeathsRatio') {
            stat = rank[keys[1]] ? Number(rank[keys[1]]).toFixed(2) : null;
          } else if (keys[1] === 'winRatio') {
            stat = rank[keys[1]] ? Math.round(rank[keys[1]] * 100) + '%' : null;
          } else {
            stat = rank[keys[1]] ? rank[keys[1]].toLocaleString() : null;
          }

          return (
            <li key={member.member.destinyUserInfo.membershipId} className={cx('linked', { thisIsYou: rank.membershipId === this.props.membershipId })}>
              <div className='rank'>
                <div className='value' />
              </div>
              <div className='displayName'>{member.member.destinyUserInfo.displayName}</div>
              <div className='stat'>{stat}</div>
            </li>
          );
        });
      };

      let subView = this.props.subView;

      if (subView === 'gambit') {
        let timePlayed = moment.duration(collated.gambit.secondsPlayed.value, 'seconds');

        collation = (
          <>
            <div className='sub-header sub'>
              <div>{t('Gambit')}</div>
            </div>
            <div className='data'>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Total time played')}</div>
                  <div className='value'>
                    {timePlayed.years() < 1 ? (
                      timePlayed.months() < 1 ? (
                        <>
                          {timePlayed.days()} {t('days')}{' '}
                        </>
                      ) : (
                        <>
                          {timePlayed.months()} {t('months')}, {timePlayed.days()} {t('days')}'
                        </>
                      )
                    ) : (
                      <>
                        {timePlayed.years()} {t('years')}, {timePlayed.months()} {t('months')}
                      </>
                    )}
                  </div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.secondsPlayed.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Primeval damage')}</div>
                  <div className='value'>{collated.gambit.primevalDamage.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.primevalDamage.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Av. win rate')}</div>
                  <div className='value'>{Math.round(collated.gambit.winRatio.value * 100)}%</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.winRatio.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Kills')}</div>
                  <div className='value'>{collated.gambit.kills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.kills.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Deaths')}</div>
                  <div className='value'>{collated.gambit.deaths.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.deaths.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Blocker kills')}</div>
                  <div className='value'>{collated.gambit.blockerKills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.blockerKills.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Motes deposited')}</div>
                  <div className='value'>{collated.gambit.motesDeposited.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.motesDeposited.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Motes lost')}</div>
                  <div className='value'>{collated.gambit.motesLost.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.motesLost.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Motes denied')}</div>
                  <div className='value'>{collated.gambit.motesDenied.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.motesDenied.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Invasion kills')}</div>
                  <div className='value'>{collated.gambit.invasionKills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.invasionKills.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Invader kills')}</div>
                  <div className='value'>{collated.gambit.invaderKills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.invaderKills.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src={`https://www.bungie.net${manifest.DestinyRecordDefinition[1261302732].displayProperties.icon}`} />
                  <div className='name'>{t('Fast Fill')}</div>
                  <div className='value'>{collated.gambit.medals_pvecomp_medal_fast_fill.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.medals_pvecomp_medal_fast_fill.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src={`https://www.bungie.net${manifest.DestinyRecordDefinition[2507615350].displayProperties.icon}`} />
                  <div className='name'>{t('Overkillmonger')}</div>
                  <div className='value'>{collated.gambit.medals_pvecomp_medal_overkillmonger.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.medals_pvecomp_medal_overkillmonger.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src={`https://www.bungie.net${manifest.DestinyRecordDefinition[1071663279].displayProperties.icon}`} />
                  <div className='name'>{t('Army of one')}</div>
                  <div className='value'>{collated.gambit.medals_pvecomp_medal_invader_kill_four.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.medals_pvecomp_medal_invader_kill_four.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src={`https://www.bungie.net${manifest.DestinyRecordDefinition[1298112482].displayProperties.icon}`} />
                  <div className='name'>{t('Mote Have Been')}</div>
                  <div className='value'>{collated.gambit.medals_pvecomp_medal_tags_denied_15.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.gambit.medals_pvecomp_medal_tags_denied_15.ordered)}</ul>
              </div>
            </div>
            <div className='flair-gambit'>
              <div className='l1 destiny-gambit_dazzle' />
              <div className='l2 destiny-gambit_dazzle' />
            </div>
          </>
        );
      } else if (subView === 'iron-banner') {
        let timePlayed = moment.duration(collated.ironBanner.secondsPlayed.value, 'seconds');

        collation = (
          <>
            <div className='sub-header sub'>
              <div>Crucible</div>
            </div>
            <div className='data'>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Total time played')}</div>
                  <div className='value'>
                    {timePlayed.years() < 1 ? (
                      timePlayed.months() < 1 ? (
                        <>
                          {timePlayed.days()} {t('days')}{' '}
                        </>
                      ) : (
                        <>
                          {timePlayed.months()} {t('months')}, {timePlayed.days()} {t('days')}'
                        </>
                      )
                    ) : (
                      <>
                        {timePlayed.years()} {t('years')}, {timePlayed.months()} {t('months')}
                      </>
                    )}
                  </div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.ironBanner.secondsPlayed.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Av. win rate')}</div>
                  <div className='value'>{Math.round(collated.ironBanner.winRatio.value * 100)}%</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.ironBanner.winRatio.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Av. K/D')}</div>
                  <div className='value'>{collated.ironBanner.killsDeathsRatio.value}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.ironBanner.killsDeathsRatio.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Kills')}</div>
                  <div className='value'>{collated.ironBanner.kills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.ironBanner.kills.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Deaths')}</div>
                  <div className='value'>{collated.ironBanner.deaths.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.ironBanner.deaths.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Most single game kills')}</div>
                  <div className='value'>{collated.ironBanner.bestSingleGameKills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.ironBanner.bestSingleGameKills.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src='/static/images/extracts/medals/medalStreak7x.png' />
                  <div className='name'>{t('Seventh Column')}</div>
                  <div className='value'>{collated.allPvP.medalStreak7x.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.medalStreak7x.ordered)}</ul>
              </div>
            </div>
          </>
        );
      } else if (subView === 'crucible') {
        let timePlayed = moment.duration(collated.allPvP.secondsPlayed.value, 'seconds');

        collation = (
          <>
            <div className='sub-header sub'>
              <div>Crucible</div>
            </div>
            <div className='data'>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Total time played')}</div>
                  <div className='value'>
                    {timePlayed.years() < 1 ? (
                      timePlayed.months() < 1 ? (
                        <>
                          {timePlayed.days()} {t('days')}{' '}
                        </>
                      ) : (
                        <>
                          {timePlayed.months()} {t('months')}, {timePlayed.days()} {t('days')}
                        </>
                      )
                    ) : (
                      <>
                        {timePlayed.years()} {t('years')}, {timePlayed.months()} {t('months')}
                      </>
                    )}
                  </div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.secondsPlayed.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Av. win rate')}</div>
                  <div className='value'>{Math.round(collated.allPvP.winRatio.value * 100)}%</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.winRatio.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Av. K/D')}</div>
                  <div className='value'>{collated.allPvP.killsDeathsRatio.value}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.killsDeathsRatio.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Kills')}</div>
                  <div className='value'>{collated.allPvP.kills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.kills.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Deaths')}</div>
                  <div className='value'>{collated.allPvP.deaths.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.deaths.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Most single game kills')}</div>
                  <div className='value'>{collated.allPvP.bestSingleGameKills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.bestSingleGameKills.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src='/static/images/extracts/medals/medalStreak7x.png' />
                  <div className='name'>{t('Seventh Column')}</div>
                  <div className='value'>{collated.allPvP.medalStreak7x.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.medalStreak7x.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src='/static/images/extracts/medals/medalStreakAbsurd.png' />
                  <div className='name'>{t('We Ran Out of Medals')}</div>
                  <div className='value'>{collated.allPvP.medalStreakAbsurd.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.medalStreakAbsurd.ordered)}</ul>
              </div>
              <div className='point hasIcon'>
                <div className='header'>
                  <ObservedImage className='image' src='/static/images/extracts/medals/medalAbilityVoidwalkerDistance.png' />
                  <div className='name'>{t('From Downtown')}</div>
                  <div className='value'>{collated.allPvP.medalAbilityVoidwalkerDistance.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvP.medalAbilityVoidwalkerDistance.ordered)}</ul>
              </div>
            </div>
          </>
        );
      } else {
        // vanguard

        let timePlayed = moment.duration(collated.allPvE.secondsPlayed.value, 'seconds');

        collation = (
          <>
            <div className='sub-header sub'>
              <div>Vanguard</div>
            </div>
            <div className='data'>
              <div className='point'>
                <div className='header'>
                  {' '}
                  <div className='name'>{t('Total time played')}</div>
                  <div className='value'>
                    {timePlayed.years() < 1 ? (
                      timePlayed.months() < 1 ? (
                        <>
                          {timePlayed.days()} {t('days')}{' '}
                        </>
                      ) : (
                        <>
                          {timePlayed.months()} {t('months')}, {timePlayed.days()} {t('days')}
                        </>
                      )
                    ) : (
                      <>
                        {timePlayed.years()} {t('years')}, {timePlayed.months()} {t('months')}
                      </>
                    )}
                  </div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.secondsPlayed.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Public events')}</div>
                  <div className='value'>{collated.allPvE.publicEvents.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.publicEvents.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Adventures')}</div>
                  <div className='value'>{collated.allPvE.adventures.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.adventures.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Strikes')}</div>
                  <div className='value'>{collated.strikes.activitiesCleared.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.strikes.activitiesCleared.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Nightfalls')}</div>
                  <div className='value'>{collated.nightfalls.activitiesCleared.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.nightfalls.activitiesCleared.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Raids')}</div>
                  <div className='value'>{collated.raids.activitiesCleared.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.raids.activitiesCleared.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Kills')}</div>
                  <div className='value'>{collated.allPvE.kills.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.kills.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Deaths')}</div>
                  <div className='value'>{collated.allPvE.deaths.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.deaths.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Av. K/D')}</div>
                  <div className='value'>{collated.allPvE.killsDeathsRatio.value}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.killsDeathsRatio.ordered)}</ul>
              </div>
              <div className='point'>
                <div className='header'>
                  <div className='name'>{t('Orbs created')}</div>
                  <div className='value'>{collated.allPvE.orbsDropped.value.toLocaleString()}</div>
                </div>
                <ul className='list roster mini leaderboard'>{getTopThree(collated.allPvE.orbsDropped.ordered)}</ul>
              </div>
            </div>
          </>
        );
      }
    }

    if (clan) {
      return (
        <div className={cx('view', this.props.theme.selected)} id='clan'>
          <div className='stats'>
            <div className='summary'>
              <div className='clan-properties'>
                <div className='name'>
                  {clan.name}
                  <div className='tag'>[{clan.clanInfo.clanCallsign}]</div>
                </div>
                {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                <div className='memberCount'>
                  // {clan.memberCount} {t('members')}
                </div>
                <div className='motto'>{clan.motto}</div>
              </div>
              <div className='views'>
                <ul className='list'>
                  <li className='linked'>
                    <NavLink to='/clan' exact>
                      {t('About')}
                    </NavLink>
                  </li>
                  <li className='linked'>
                    <NavLink to='/clan/roster'>{t('Roster')}</NavLink>
                  </li>
                  <li className='linked'>
                    <NavLink to='/clan/stats'>{t('Stats')}</NavLink>
                  </li>
                  <li className='linked child'>
                    <NavLink to='/clan/stats' exact>
                      {t('Vanguard')}
                    </NavLink>
                  </li>
                  <li className='linked child'>
                    <NavLink to='/clan/stats/crucible'>{t('Crucible')}</NavLink>
                  </li>
                  <li className='linked child'>
                    <NavLink to='/clan/stats/gambit'>{t('Gambit')}</NavLink>
                  </li>
                </ul>
              </div>
            </div>
            <div className='collation'>{this.state.members.length > 0 ? collation : <Spinner />}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={cx('view', this.props.theme.selected)} id='clan'>
          <div className='no-clan'>
            <div className='properties'>
              <div className='name'>{t('No clan affiliation')}</div>
              <div className='description'>
                <p>{t('Clans are optional groups of friends that enhance your online gaming experience. Coordinate with your clanmates to take on co-op challenges or just simply represent them in your solo play to earn extra rewards.')}</p>
                <p>{t("Join your friend's clan, meet some new friends, or create your own on the companion app or at bungie.net.")}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  console.log(state, ownProps);
  return {
    profile: state.profile,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(StatsView);
