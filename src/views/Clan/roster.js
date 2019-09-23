import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import { ProfileNavLink } from '../../components/ProfileLink';
import Roster from '../../components/Roster';
import Spinner from '../../components/UI/Spinner';

import './roster.css';

class RosterView extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { t, member, group, groupMembers, theme } = this.props;

    return (
      <div className={cx('view', theme.selected)} id='clan'>
        <div className='roster'>
          <div className='summary'>
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
            </div>
            <div className='views'>
              <ul className='list'>
                <li className='linked'>
                  <ProfileNavLink to='/clan' exact>{t('About')}</ProfileNavLink>
                </li>
                <li className='linked'>
                  <ProfileNavLink to='/clan/roster'>{t('Roster')}</ProfileNavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className='members'>
            <div className='liteRefresh'>{groupMembers.loading && groupMembers.responses.length !== 0 ? <Spinner mini /> : null}</div>
            {groupMembers.loading && groupMembers.responses.length === 0 ? <Spinner /> : <Roster linked />}
          </div>
        </div>
      </div>
    );
  }
}

export default RosterView;
