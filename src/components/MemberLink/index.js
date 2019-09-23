import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import Moment from 'react-moment';

import ObservedImage from '../ObservedImage';
import Spinner from '../UI/Spinner';
import Button from '../UI/Button';
import ProgressBar from '../UI/ProgressBar';
import manifest from '../../utils/manifest';
import * as bungie from '../../utils/bungie';
import * as voluspa from '../../utils/voluspa';
import * as responseUtils from '../../utils/responseUtils';
import * as destinyUtils from '../../utils/destinyUtils';
import * as destinyEnums from '../../utils/destinyEnums';
import userFlair from '../../data/userFlair';
// import store from '../../utils/reduxStore';

import './styles.css';

class MemberLink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      basic: {
        loading: true,
        data: false,
        error: false
      },
      all: {
        loading: false,
        data: false,
        error: false
      },
      voluspa: {
        loading: true,
        data: false,
        error: false
      },
      overlay: false
    };
    this.mounted = false;
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getFullProfileData = async () => {
    const { type, id } = this.props;

    if (this.mounted) {
      try {
        let requests = [bungie.memberProfile(type, id, '100,200,202,204,800,900'), bungie.memberGroups(type, id)];

        let [profile, group] = await Promise.all(requests);

        profile = responseUtils.profileScrubber(profile, 'activity');

        if (!profile.profileRecords.data) {
          this.setState((prevState, props) => {
            prevState.all.error = true;
            return prevState;
          });
        } else {
          let data = {
            ...profile,
            group: group && group.results.length ? group.results[0].group : false
          };

          // console.log(data);

          this.setState((prevState, props) => {
            prevState.all.error = false;
            prevState.all.data = data;
            prevState.all.loading = false;
            return prevState;
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  getVoluspaData = async () => {
    const { type, id } = this.props;

    if (this.mounted) {
      try {
        let data = await voluspa.leaderboardPosition(type, id);

        this.setState((prevState, props) => {
          prevState.voluspa.error = data ? false : true;
          prevState.voluspa.data = data ? data : false;
          prevState.voluspa.loading = false;
          return prevState;
        });
      } catch (e) {
        this.setState((prevState, props) => {
          prevState.voluspa.error = true;
          prevState.voluspa.data = false;
          prevState.voluspa.loading = false;
          return prevState;
        });
      }
    }
  };

  activateOverlay = async e => {
    e.stopPropagation();

    this.setState((prevState, props) => {
      prevState.overlay = true;
      return prevState;
    });

    this.getFullProfileData();
    this.getVoluspaData();
  };

  deactivateOverlay = e => {
    e.stopPropagation();
    if (this.mounted) {
      this.setState((prevState, props) => {
        prevState.overlay = false;
        return prevState;
      });
    }
  };

  async componentDidMount() {
    const { type, id, displayName = false } = this.props;

    if (this.mounted) {
      try {
        let response = await bungie.memberProfile(type, id, displayName ? '200' : '100,200');
        let data = responseUtils.profileScrubber(response, 'activity');
        this.setState((prevState, props) => {
          prevState.basic.data = data;
          prevState.basic.loading = false;
          return prevState;
        });
      } catch (e) {}
    }
  }

  render() {
    const { t, member, type, id, displayName = false, characterId, hideFlair = false } = this.props;

    let characterBasic;
    if (this.state.basic.data) {
      if (characterId) {
        characterBasic = this.state.basic.data.characters.data.find(c => c.characterId === characterId);
        if (!characterBasic) characterBasic = this.state.basic.data.characters.data[0];
      } else {
        characterBasic = this.state.basic.data.characters.data[0];
      }
    }

    let timePlayed;
    if (this.state.all.data) {
      timePlayed = Math.floor(
        Object.keys(this.state.all.data.characters.data).reduce((sum, key) => {
          return sum + parseInt(this.state.all.data.characters.data[key].minutesPlayedTotal);
        }, 0) / 1440
      );
    }

    let flair = userFlair.find(f => f.user === type + id);
    let primaryFlair = false;
    if (flair) {
      primaryFlair = flair.trophies.find(t => t.primary);
    }

    return (
      <>
        <div className='member-link' onClick={this.activateOverlay}>
          {!hideFlair && primaryFlair ? (
            <div className={cx('user-flair', primaryFlair.classnames)}>
              <i className={primaryFlair.icon} />
            </div>
          ) : null}
          <div className='emblem'>{!this.state.basic.loading && this.state.basic.data ? <ObservedImage className='image' src={`https://www.bungie.net${characterBasic.emblemPath}`} /> : null}</div>
          <div className='displayName'>{displayName ? displayName : !this.state.basic.loading && this.state.basic.data ? this.state.basic.data.profile.data.userInfo.displayName : null}</div>
        </div>
        {this.state.overlay ? (
          <div id='member-overlay' className={cx({ error: this.state.all.error })}>
            <div className='wrapper-outer'>
              <div className='background'>
                <div className='border-top' />
                <div className='acrylic' />
              </div>
              <div className={cx('wrapper-inner')}>
                {!this.state.all.loading && this.state.all.data && !this.state.all.error ? (
                  <>
                    <div className='module'>
                      <div className='head'>
                        <div className='displayName'>{this.state.all.data.profile.data && this.state.all.data.profile.data.userInfo.displayName}</div>
                        <div className='groupName'>{this.state.all.data.group ? this.state.all.data.group.name : null}</div>
                        <div className='stamps'>
                          <div>
                            <i className={`destiny-platform_${destinyEnums.PLATFORMS[type].toLowerCase()}`} />
                          </div>
                          {flair
                            ? flair.trophies.map((s, i) => {
                                return (
                                  <div key={i}>
                                    <i className={cx(s.icon, s.classnames)} />
                                  </div>
                                );
                              })
                            : null}
                        </div>
                      </div>
                      <div className='sub-header'>
                        <div>Basics</div>
                      </div>
                      <div className='basics'>
                        <div>
                          <div className='value'>
                            {timePlayed} {timePlayed === 1 ? t('day played') : t('days played')}
                          </div>
                          <div className='name'>Time played accross characters</div>
                        </div>
                        <div>
                          <div className='value'>{this.state.all.data.profileRecords.data.score.toLocaleString('en-us')}</div>
                          <div className='name'>Triumph score</div>
                        </div>
                        <div>
                          <div className='value'>{destinyUtils.collectionTotal(this.state.all.data).toLocaleString('en-us')}</div>
                          <div className='name'>Collection total</div>
                        </div>
                      </div>
                    </div>
                    <div className='module'>
                      <div className='sub-header'>
                        <div>Leaderboards</div>
                      </div>
                      {this.state.voluspa.data && this.state.voluspa.data.data ? (
                        <div className='ranks'>
                          <div>
                            <div className='value'>{this.state.voluspa.data.data.ranks.triumphScore.toLocaleString('en-us')}</div>
                            <div className='name'>Triumph score rank</div>
                          </div>
                          <div>
                            <div className='value'>{this.state.voluspa.data.data.ranks.collectionTotal.toLocaleString('en-us')}</div>
                            <div className='name'>Collections rank</div>
                          </div>
                          <div>
                            <div className='value'>{this.state.voluspa.data.data.ranks.timePlayed.toLocaleString('en-us')}</div>
                            <div className='name'>Time played rank</div>
                          </div>
                        </div>
                      ) : this.state.voluspa.loading ? (
                        <div className='ranks loading'>
                          <Spinner mini />
                        </div>
                      ) : (
                        <div className='ranks error'>
                          <div>{this.state.voluspa.data && this.state.voluspa.data.status ? this.state.voluspa.data.status : `VOLUSPA is currently unavailable`}</div>
                        </div>
                      )}
                      <div className='sub-header'>
                        <div>Characters</div>
                      </div>
                      <div className='characters'>
                        <div>
                          {this.state.all.data.characters.data.map(c => {
                            let state = null;
                            if (this.state.all.data.characterActivities.data[c.characterId].currentActivityHash === 0 || this.state.all.data.characterActivities.data[c.characterId].currentActivityHash === 82913930) {
                              state = (
                                <>
                                  <div className='time-before'>{t('Last played')}</div>
                                  <Moment fromNow>{this.state.all.data.characters.data.find(d => d.characterId === c.characterId).dateLastPlayed}</Moment>
                                </>
                              );
                            } else {
                              state = (
                                <>
                                  <div className='activity'>
                                    {manifest.DestinyActivityModeDefinition[this.state.all.data.characterActivities.data[c.characterId].currentActivityModeHash].displayProperties.name}: {manifest.DestinyActivityDefinition[this.state.all.data.characterActivities.data[c.characterId].currentActivityHash].displayProperties.name}
                                  </div>
                                  <Moment fromNow>{this.state.all.data.characters.data.find(d => d.characterId === c.characterId).dateLastPlayed}</Moment>
                                </>
                              );
                            }

                            return (
                              <div key={c.characterId} className='char'>
                                <Button
                                  className='linked'
                                  anchor
                                  to={`/${type}/${id}/${c.characterId}`}
                                  action={() => {
                                    /* store.dispatch({ type: 'MEMBER_LOAD_MEMBERSHIP', payload: { membershipType: type, membershipId: id } }); */
                                  }}
                                >
                                  <div className='icon'>
                                    <i
                                      className={`destiny-class_${destinyUtils
                                        .classTypeToString(c.classType)
                                        .toString()
                                        .toLowerCase()}`}
                                    />
                                  </div>
                                  <div className='text'>
                                    <div>
                                      {destinyUtils.raceHashToString(c.raceHash, c.genderType, true)} {destinyUtils.classHashToString(c.classHash, c.genderType)}
                                    </div>
                                    <div>
                                      <span>{c.baseCharacterLevel}</span>
                                      <span>
                                        <span>{c.light}</span>
                                      </span>
                                    </div>
                                  </div>
                                </Button>
                                {c.titleRecordHash ? <div className='title'>{manifest.DestinyRecordDefinition[c.titleRecordHash].titleInfo.titlesByGenderHash[c.genderHash]}</div> : null}
                                <div className='state'>{state}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className='module'>
                      <div className='sub-header'>
                        <div>Progression</div>
                      </div>
                      <ul className='list progress-bars progression'>
                        <li>
                          <ProgressBar
                            classNames='valor'
                            objectiveDefinition={{
                              progressDescription: manifest.DestinyProgressionDefinition[2626549951].displayProperties.name,
                              completionValue: destinyUtils.totalValor()
                            }}
                            playerProgress={{
                              progress: this.state.all.data.characterProgressions.data[this.state.all.data.characters.data[0].characterId].progressions[2626549951].currentProgress,
                              complete: this.state.all.data.characterProgressions.data[this.state.all.data.characters.data[0].characterId].progressions[2626549951].currentProgress === destinyUtils.totalValor(),
                              objectiveHash: 2626549951
                            }}
                            hideCheck
                            chunky
                          />
                        </li>
                        <li>
                          <ProgressBar
                            classNames='glory'
                            objectiveDefinition={{
                              progressDescription: manifest.DestinyProgressionDefinition[2000925172].displayProperties.name,
                              completionValue: destinyUtils.totalGlory()
                            }}
                            playerProgress={{
                              progress: this.state.all.data.characterProgressions.data[this.state.all.data.characters.data[0].characterId].progressions[2000925172].currentProgress,
                              complete: this.state.all.data.characterProgressions.data[this.state.all.data.characters.data[0].characterId].progressions[2000925172].currentProgress === destinyUtils.totalGlory(),
                              objectiveHash: 2000925172
                            }}
                            hideCheck
                            chunky
                          />
                        </li>
                        <li>
                          <ProgressBar
                            classNames='infamy'
                            objectiveDefinition={{
                              progressDescription: manifest.DestinyProgressionDefinition[2772425241].displayProperties.name,
                              completionValue: destinyUtils.totalInfamy()
                            }}
                            playerProgress={{
                              progress: this.state.all.data.characterProgressions.data[this.state.all.data.characters.data[0].characterId].progressions[2772425241].currentProgress,
                              complete: this.state.all.data.characterProgressions.data[this.state.all.data.characters.data[0].characterId].progressions[2772425241].currentProgress === destinyUtils.totalInfamy(),
                              objectiveHash: 2772425241
                            }}
                            hideCheck
                            chunky
                          />
                        </li>
                      </ul>
                      <div className='sub-header'>
                        <div>Seals</div>
                      </div>
                      <ul className='list progress-bars seals'>
                        {manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.medalsRootNode].children.presentationNodes.map((s, i) => {
                          let node = manifest.DestinyPresentationNodeDefinition[s.presentationNodeHash];
                          let record = manifest.DestinyRecordDefinition[node.completionRecordHash];
                          // let images = {
                          //   2588182977: '037E-00001367.png',
                          //   3481101973: '037E-00001343.png',
                          //   147928983: '037E-0000134A.png',
                          //   2693736750: '037E-0000133C.png',
                          //   2516503814: '037E-00001351.png',
                          //   1162218545: '037E-00001358.png',
                          //   2039028930: '0560-000000EB.png',
                          //   991908404: '0560-0000107E.png'
                          // };
                          let completionValue = this.state.all.data.profileRecords.data.records[node.completionRecordHash].objectives[0].completionValue;
                          let progress = this.state.all.data.profileRecords.data.records[node.completionRecordHash].objectives[0].progress;

                          return (
                            <li key={i}>
                              <ProgressBar
                                objectiveDefinition={{
                                  progressDescription: record.titleInfo.titlesByGenderHash[2204441813],
                                  completionValue
                                }}
                                playerProgress={{
                                  progress,
                                  complete: progress === completionValue,
                                  objectiveHash: node.completionRecordHash
                                }}
                                hideCheck
                                chunky
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : this.state.all.error ? (
                  <>
                    <div>
                      <div className='icon'>
                        <ObservedImage className='image' src='/static/images/extracts/ui/010A-00000552.PNG' />
                      </div>
                    </div>
                    <div>
                      <div className='text'>
                        <div className='name'>Private profile</div>
                        <div className='description'>This user has their profile privacy set to private</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
              <div className='sticky-nav mini ultra-black'>
                <div className='sticky-nav-inner'>
                  <div />
                  <ul>
                    <li>
                      <Button action={this.deactivateOverlay}>
                        <i className='destiny-B_Button' /> {t('Dismiss')}
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(MemberLink);
