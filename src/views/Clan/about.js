import React from 'react';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';

import * as bungie from '../../utils/bungie';
import { ProfileNavLink } from '../../components/ProfileLink';
import ClanBanner from '../../components/UI/ClanBanner';
import Roster from '../../components/Roster';
import Spinner from '../../components/UI/Spinner';
import ProgressBar from '../../components/UI/ProgressBar';
import Checkbox from '../../components/UI/Checkbox';
import manifest from '../../utils/manifest';

import './about.css';

class AboutView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      weeklyRewardState: false
    };
  }

  async componentDidMount() {
    const groupId = this.props.group.groupId;
    const groupWeeklyRewardState = await bungie.groupWeeklyRewardState(groupId);

    this.setState({ weeklyRewardState: groupWeeklyRewardState });
  }

  render() {
    const { t, member, group, groupMembers, theme } = this.props;
    const characters = member.data.profile.characters.data;
    const characterIds = characters.map(c => c.characterId);

    const weeklyRewardState = this.state.weeklyRewardState;

    const clanLevel = group.clanInfo.d2ClanProgressions[584850370];

    let weeklyPersonalContribution = characterIds.reduce((currentValue, characterId) => {
      let characterProgress = member.data.profile.characterProgressions.data[characterId].progressions[540048094].weeklyProgress || 0;
      return characterProgress + currentValue;
    }, 0);

    const weeklyClanEngramsDefinition = manifest.DestinyMilestoneDefinition[4253138191].rewards[1064137897].rewardEntries;
    let rewardState = null;
    if (this.state.weeklyRewardState) {
      rewardState = weeklyRewardState.rewards.find(reward => reward.rewardCategoryHash === 1064137897).entries;
    }

    return (
      <div className={cx('view', theme.selected)} id='clan'>
        <div className='about'>
          <div className='banner'>
            <ClanBanner bannerData={group.clanInfo.clanBannerData} />
          </div>
          <div className='overview'>
            <div className='clan-properties'>
              <div className='name'>
                {group.name}
                <div className='tag'>[{group.clanInfo.clanCallsign}]</div>
              </div>
              {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
              <div className='memberCount'>
                // {group.memberCount} {t('members')} / {groupMembers.responses.filter(member => member.isOnline).length} {t('online')}
              </div>
              <div className='motto'>{group.motto}</div>
              <ReactMarkdown className='bio' escapeHtml disallowedTypes={['image', 'imageReference']} source={group.about} />
            </div>
            <div className='sub-header sub'>
              <div>{t('Season')} 6</div>
            </div>
            <div className='progression'>
              <div className='clanLevel'>
                <div className='text'>{t('Clan level')}</div>
                <ProgressBar
                  objectiveDefinition={{
                    progressDescription: `${t('Level')} ${clanLevel.level}`,
                    completionValue: clanLevel.nextLevelAt
                  }}
                  playerProgress={{
                    progress: clanLevel.progressToNextLevel,
                    objectiveHash: 'clanLevel'
                  }}
                  hideCheck
                  chunky
                />
              </div>
            </div>
            <div className='sub-header sub'>
              <div>{t('Clan details')}</div>
            </div>
            <div className='progression details'>
              <div className='weeklyRewardState'>
                <div className='text'>{t('Weekly Clan Engrams')}</div>
                <ul>
                  {rewardState ? (
                    rewardState.map(reward => (
                      <li key={reward.rewardEntryHash}>
                        <Checkbox completed={reward.earned} text={weeklyClanEngramsDefinition[reward.rewardEntryHash].displayProperties.name} />
                      </li>
                    ))
                  ) : (
                    <Spinner />
                  )}
                </ul>
              </div>
              <div className='personalContribution'>
                <div className='text'>{t('Weekly Personal XP Contribution')}</div>
                <Checkbox
                  completed={weeklyPersonalContribution === (characterIds.length * 5000)}
                  text={
                    <>
                      <span>{weeklyPersonalContribution}</span> / {characterIds.length * 5000}
                    </>
                  }
                />
              </div>
            </div>
          </div>
          <div className='roster'>
            <div className='sub-header sub'>
              <div>{t('Views')}</div>
            </div>
            <div className='views'>
              <ul className='list'>
                <li className='linked'>
                  <ProfileNavLink to='/clan' exact>
                    {t('About')}
                  </ProfileNavLink>
                </li>
                <li className='linked'>
                  <ProfileNavLink to='/clan/roster'>{t('Roster')}</ProfileNavLink>
                </li>
              </ul>
            </div>
            <div className='sub-header sub'>
              <div>{t('Clan roster')}</div>
              <div>{groupMembers.responses.filter(member => member.isOnline).length} online</div>
            </div>
            {groupMembers.loading && groupMembers.responses.length === 0 ? <Spinner /> : <Roster mini linked isOnline />}
          </div>
        </div>
      </div>
    );
  }
}

export default AboutView;
