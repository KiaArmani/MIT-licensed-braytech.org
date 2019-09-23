import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Moment from 'react-moment';
import cx from 'classnames';
import { orderBy, flattenDepth } from 'lodash';

import manifest from '../../utils/manifest';
import { ProfileLink } from '../../components/ProfileLink';
import Collectibles from '../../components/Collectibles';
import Spinner from '../../components/UI/Spinner';
import ObservedImage from '../../components/ObservedImage';
import ProgressBar from '../../components/UI/ProgressBar';
import Roster from '../../components/Roster';
import * as utils from '../../utils/destinyUtils';

import './styles.css';

class SitRep extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { t, member, groupMembers } = this.props;
    const group = member.data.groups.results.length > 0 ? member.data.groups.results[0].group : false;
    const characterId = member.characterId;
    const characters = member.data.profile.characters.data;
    const character = characters.find(c => c.characterId === characterId);
    const profileRecords = member.data.profile.profileRecords.data.records;
    const characterProgressions = member.data.profile.characterProgressions.data;

    const milestonesData = Object.values(member.data.milestones).map(m => manifest.DestinyMilestoneDefinition[m.milestoneHash]);
    // console.log(milestonesData);

    let milestones = [];
    Object.values(member.data.profile.characterProgressions.data[characterId].milestones).forEach(milestone => {
      let def = manifest.DestinyMilestoneDefinition[milestone.milestoneHash];

      if (milestone.milestoneHash === 4253138191) {
        return; // Weekly Clan Engrams
      }

      // console.log(def.displayProperties.name, milestone);

      let state = {
        earned: false,
        redeemed: false,
        objective: {
          progress: 0,
          completionValue: 1
        },
        rewards: []
      };

      let displayProperties = {
        name: def.displayProperties.name,
        description: def.displayProperties.description
      }

      // console.log(manifest.DestinyMilestoneDefinition[milestone.milestoneHash].rewards)

      // if (manifest.DestinyMilestoneDefinition[milestone.milestoneHash].rewards) {
      //   state.reward = true;
      // }

      // if (manifest.DestinyMilestoneDefinition[milestone.milestoneHash].quests) {
      //   console.log(manifest.DestinyMilestoneDefinition[milestone.milestoneHash], milestone)
      // }
      
      if (milestone.availableQuests) {
        let availableQuest = milestone.availableQuests[0];

        state.earned = availableQuest.status.completed;
        state.redeemed = availableQuest.status.redeemed;
        state.objective.progress = availableQuest.status.stepObjectives[0].progress;
        state.objective.completionValue = availableQuest.status.stepObjectives[0].completionValue;

        displayProperties.name = manifest.DestinyMilestoneDefinition[milestone.milestoneHash].quests[availableQuest.questItemHash].displayProperties.name;
        displayProperties.description = manifest.DestinyObjectiveDefinition[availableQuest.status.stepObjectives[0].objectiveHash].displayProperties.description !== '' ? manifest.DestinyObjectiveDefinition[availableQuest.status.stepObjectives[0].objectiveHash].displayProperties.description : manifest.DestinyObjectiveDefinition[availableQuest.status.stepObjectives[0].objectiveHash].progressDescription;

        let questItem = manifest.DestinyInventoryItemDefinition[availableQuest.questItemHash];
        if (questItem.value) {
          let questRewardItem = questItem.value.itemValue.find(i => i.itemHash);
          if (questRewardItem) {
            state.rewards.push(questRewardItem.itemHash);
          }
        }
      } else if (milestone.rewards) {
        if (milestone.activities && milestone.activities.length) {
          milestone.activities.forEach(a => {
            if (a.challenges.length > 0) {
              a.challenges.forEach(c => {
                state.earned = c.objective.complete;
                state.objective.progress = c.objective.progress;
                state.objective.completionValue = c.objective.completionValue;
              });
            }
          });
        } else {
          state.earned = milestone.rewards[0].entries[0].earned;
          state.redeemed = milestone.rewards[0].entries[0].redeemed;
        }
        
        let rewardEntryHashes = flattenDepth(milestone.rewards.map(r => r.entries), 1).map(r => r.rewardEntryHash);
        let mappedRewards = flattenDepth(rewardEntryHashes.map(r => Object.values(manifest.DestinyMilestoneDefinition[milestone.milestoneHash].rewards[r].rewardEntries).find(e => e.rewardEntryHash === r).items), 1).map(i => i.itemHash)

        state.rewards.push(...mappedRewards);
      } else {
        return;
      }

      // console.log(state.rewards)

      milestones.push({
        order: milestone.order,
        element: (
          <li key={milestone.milestoneHash} className={cx({ earned: state.earned, redeemed: state.redeemed })}>
            <ProgressBar
              objectiveDefinition={{
                progressDescription: displayProperties.name,
                completionValue: state.objective.completionValue
              }}
              playerProgress={{
                progress: state.objective.progress,
                objectiveHash: milestone.milestoneHash
              }}
              hideCheck
            />
            <div className='text'>{displayProperties.description}</div>
            {state.rewards.map((r, i) => {
              const def = manifest.DestinyInventoryItemDefinition[r];
              return (
                <div key={i} className='reward'>
                  <ObservedImage className='image' src={`https://www.bungie.net${def.displayProperties.icon}`} />
                  <div className='name'>{def.displayProperties.name}</div>
                </div>
              )
            })}
          </li>
        )
      });
    });

    milestones = orderBy(milestones, [m => m.order], ['asc']);

    const wellRestedState = utils.isWellRested(this.props.member.data.profile.characterProgressions.data[character.characterId]);

    if (wellRestedState.wellRested) {
      milestones.unshift({
        order: 0,
        element: (
          <li key='rest' className='well-rested'>
            <ProgressBar
              objectiveDefinition={{
                progressDescription: 'Well rested',
                completionValue: wellRestedState.requiredXP
              }}
              playerProgress={{
                progress: wellRestedState.progress,
                objectiveHash: 'rest'
              }}
              hideCheck
            />
            <div className='text'>XP gains increased by 3x for your first 3 Levels this week.</div>
          </li>
        )
      });
    }
    
    const valor = {
      defs: {
        rank: manifest.DestinyProgressionDefinition[2626549951],
        activity: manifest.DestinyActivityDefinition[2274172949]
      },
      progression: {
        data: characterProgressions[characterId].progressions[2626549951],
        total: 0,
        resets: profileRecords[559943871] ? profileRecords[559943871].objectives[0].progress : 0
      }
    };

    valor.progression.total = Object.keys(valor.defs.rank.steps).reduce((sum, key) => {
      return sum + valor.defs.rank.steps[key].progressTotal;
    }, 0);

    const glory = {
      defs: {
        rank: manifest.DestinyProgressionDefinition[2000925172],
        activity: manifest.DestinyActivityDefinition[2947109551]
      },
      progression: {
        data: characterProgressions[characterId].progressions[2000925172],
        total: 0
      }
    };

    glory.progression.total = Object.keys(glory.defs.rank.steps).reduce((sum, key) => {
      return sum + glory.defs.rank.steps[key].progressTotal;
    }, 0);

    const infamy = {
      defs: {
        rank: manifest.DestinyProgressionDefinition[2772425241],
        activity: manifest.DestinyActivityDefinition[3577607128]
      },
      progression: {
        data: characterProgressions[characterId].progressions[2772425241],
        total: 0,
        resets: profileRecords[3901785488] ? profileRecords[3901785488].objectives[0].progress : 0
      }
    };

    infamy.progression.total = Object.keys(infamy.defs.rank.steps).reduce((sum, key) => {
      return sum + infamy.defs.rank.steps[key].progressTotal;
    }, 0);

    const rareCollectibles = () => {
      let checks = [
        4274523516, // Redrix's Claymore
        1111219481, // Redrix's Broadsword
        3260604718, // Luna's Howl
        3260604717, // Not Forgotten
        4047371119, // The Mountaintop
        2335550020, // The Recluse

        3810740723, // Loaded Question
        4037097478, // Nightshade
        543982652, // Oxygen SR3

        1666039008, // Breakneck
        1639266456, // 21% Delirium
        1660030045, // Malfeasance
        3074058273, // The Last Word

        1660030044, // Wish-Ender

        199171386, // Sleeper Simulant
        199171387, // Worldline Zero

        3875807583, // Whisper of the Worm
        3142437750, // A Thousand Wings

        1469913803 // Harbinger's Echo
      ];

      return (
        <ul className='list collection-items'>
          <Collectibles selfLinkFrom='/sit-rep' hashes={checks} />
        </ul>
      );
    };

    return (
      <div className='view' id='sit-rep'>
        <div className='head'>
          <div className='col'>
            <div className='page-header'>
              <div className='name'>{t('Welcome back, ') + (character.titleRecordHash ? manifest.DestinyRecordDefinition[character.titleRecordHash].titleInfo.titlesByGenderHash[character.genderHash] : t('Guardian'))}</div>
              <div className='description'>{t("Be more aware of your surroundings, Guardian.")}</div>
            </div>
            {/* <div className='text'>
              <p>The bottom line is, I've been building Braytech for over a year now and I'm <em>still</em> discovering amazing community projects. This is an effort to chronicle the best and brightest.</p>
              <p>Additionally, who doesn't love the artists of Destiny? I'm curating hyperlinks to their portfolios.</p>
            </div> */}
          </div>
          {/* <div className='col'></div> */}
        </div>
        <div className='col'>
          <div className='module ranks'>
            <div className='sub-header sub'>
              <div>{t('Ranks')}</div>
            </div>
            <div className='modes'>
              <div className='mode gambit'>
                <div className='rank-image-set'>
                  <ObservedImage className='image ui' src='/static/images/extracts/ui/01E3-00000EAC.PNG' />
                  <ObservedImage className='image rank' src={`https://www.bungie.net${infamy.defs.rank.steps[infamy.progression.data.stepIndex].icon}`} />
                </div>
                <div className='properties'>
                  <div className='text'>
                    <div className='name'>{infamy.defs.activity.displayProperties.name}</div>
                    <div className='resets'>{infamy.progression.resets} resets</div>
                  </div>
                  <div className='progress'>
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: `Next rank: ${infamy.defs.rank.currentProgress === infamy.progression.total && infamy.progression.data.stepIndex === infamy.defs.rank.steps.length ? infamy.defs.rank.steps[0].stepName : infamy.defs.rank.steps[(infamy.progression.data.stepIndex + 1) % infamy.defs.rank.steps.length].stepName}`,
                        completionValue: infamy.progression.data.nextLevelAt
                      }}
                      playerProgress={{
                        progress: infamy.progression.data.progressToNextLevel,
                        objectiveHash: 'infamy'
                      }}
                      hideCheck
                      chunky
                    />
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: infamy.defs.rank.displayProperties.name,
                        completionValue: infamy.progression.total
                      }}
                      playerProgress={{
                        progress: infamy.progression.data.currentProgress,
                        objectiveHash: 'infamy'
                      }}
                      hideCheck
                      chunky
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='modes'>
              <div className='mode quickplay'>
                <div className='rank-image-set'>
                  <ObservedImage className='image ui' src='/static/images/extracts/ui/01E3-00000EAC.PNG' />
                  <ObservedImage className='image rank' src={`https://www.bungie.net${valor.defs.rank.steps[valor.progression.data.stepIndex].icon}`} />
                </div>
                <div className='properties'>
                  <div className='text'>
                    <div className='name'>{valor.defs.activity.displayProperties.name}</div>
                    <div className='resets'>{valor.progression.resets} resets</div>
                  </div>
                  <div className='progress'>
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: `Next rank: ${valor.defs.rank.currentProgress === valor.progression.total && valor.progression.data.stepIndex === valor.defs.rank.steps.length ? valor.defs.rank.steps[0].stepName : valor.defs.rank.steps[(valor.progression.data.stepIndex + 1) % valor.defs.rank.steps.length].stepName}`,
                        completionValue: valor.progression.data.nextLevelAt
                      }}
                      playerProgress={{
                        progress: valor.progression.data.progressToNextLevel,
                        objectiveHash: 'valor'
                      }}
                      hideCheck
                      chunky
                    />
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: valor.defs.rank.displayProperties.name,
                        completionValue: valor.progression.total
                      }}
                      playerProgress={{
                        progress: valor.progression.data.currentProgress,
                        objectiveHash: 'valor'
                      }}
                      hideCheck
                      chunky
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='modes'>
              <div className='mode competitive'>
                <div className='rank-image-set'>
                  <ObservedImage className='image ui' src='/static/images/extracts/ui/01E3-00000EAC.PNG' />
                  <ObservedImage className='image rank' src={`https://www.bungie.net${glory.defs.rank.steps[glory.progression.data.stepIndex].icon}`} />
                </div>
                <div className='properties'>
                  <div className='text'>
                    <div className='name'>{glory.defs.activity.displayProperties.name}</div>
                  </div>
                  <div className='progress'>
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: `Next rank: ${glory.defs.rank.currentProgress === glory.progression.total && glory.progression.data.stepIndex === glory.defs.rank.steps.length ? glory.defs.rank.steps[0].stepName : glory.defs.rank.steps[(glory.progression.data.stepIndex + 1) % glory.defs.rank.steps.length].stepName}`,
                        completionValue: glory.progression.data.nextLevelAt
                      }}
                      playerProgress={{
                        progress: glory.progression.data.progressToNextLevel,
                        objectiveHash: 'glory'
                      }}
                      hideCheck
                      chunky
                    />
                    <ProgressBar
                      objectiveDefinition={{
                        progressDescription: glory.defs.rank.displayProperties.name,
                        completionValue: glory.progression.total
                      }}
                      playerProgress={{
                        progress: glory.progression.data.currentProgress,
                        objectiveHash: 'glory'
                      }}
                      hideCheck
                      chunky
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='module rare-gear'>
            <div className='sub-header sub'>
              <div>{t('Rare gear')}</div>
            </div>
            {rareCollectibles()}
          </div>
        </div>
        <div className='col'>
          <div className='module milestones'>
            <div className='sub-header sub'>
              <div>{t('Milestones')}</div>
            </div>
            <ul className='list'>{milestones.map(m => m.element)}</ul>
          </div>
        </div>
        <div className='col'>
          {group ? <div className='module clan-roster'>
            <div className='sub-header sub'>
              <div>{t('Clan roster')}</div>
              <div>{groupMembers.responses.filter(member => member.isOnline).length} online</div>
            </div>
            <div className='refresh'>{groupMembers.loading && groupMembers.responses.length !== 0 ? <Spinner mini /> : null}</div>
            {groupMembers.loading && groupMembers.responses.length === 0 ? <Spinner /> : <Roster mini linked isOnline />}
          </div> : null}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    groupMembers: state.groupMembers,
    collectibles: state.collectibles
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(SitRep);
