import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import ProgressBar from '../../UI/ProgressBar';
import { classHashToString } from '../../../utils/destinyUtils';
import { ProfileNavLink } from '../../ProfileLink';
import Footer from '../Footer';

import './styles.css';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navOpen: false,
      lastUpdate: false,
      updateFlash: false
    };

    this.updateFlash = false;
    this.navEl = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.member.data.updated !== this.props.member.data.updated && this.state.lastUpdate !== this.props.member.data.updated && !this.state.updateFlash) {
      this.setState({ lastUpdate: this.props.member.data.updated, updateFlash: true });
    }
    if (this.state.updateFlash) {
      window.setTimeout(() => {
        this.setState({ updateFlash: false });
      }, 1000);
    }
    if (this.state.navOpen) {
      this.navEl.current.addEventListener('touchmove', this.nav_touchMove, true);
    }
  }

  nav_touchMove = e => {
    //e.preventDefault();
    //e.stopPropagation()
  };

  toggleNav = () => {
    if (!this.state.navOpen) {
      this.setState({ navOpen: true });
    } else {
      this.setState({ navOpen: false });
    }
  };

  closeNav = () => {
    if (this.state.navOpen) {
      this.setState({ navOpen: false });
    }
  };

  openNav = () => {
    this.setState({ navOpen: true });
  };

  navOverlayLink = state => {
    if (state) {
      return (
        <div className='trigger' onClick={this.toggleNav}>
          <i className='uniE106' />
          Exit
        </div>
      );
    } else {
      return (
        <div className='trigger' onClick={this.toggleNav}>
          <i className='uniEA55' />
          Views
        </div>
      );
    }
  };

  render() {
    const { t, route, viewport, member } = this.props;
    let views = [
      {
        name: t('Clan'),
        desc: t('Check in on your clan'),
        slug: '/clan',
        exact: false,
        profile: true,
        primary: true
      },
      {
        name: t('Collections'),
        desc: t('Items your Guardian has acquired'),
        slug: '/collections',
        exact: false,
        profile: true,
        primary: true
      },
      {
        name: t('Triumphs'),
        desc: t("Records your Guardian has achieved"),
        slug: '/triumphs',
        exact: false,
        profile: true,
        primary: true
      },
      {
        name: t('This Week'),
        desc: t('Prestigious records and valued items up for grabs this week'),
        slug: '/this-week',
        exact: true,
        profile: true,
        primary: true
      },
      {
        name: t('Checklists'),
        desc: t('Complete lists of collectibles, scannables, etc.'),
        slug: '/checklists',
        exact: true,
        profile: true,
        primary: true
      },
      {
        name: t('PGCRs'),
        desc: t('Explore your Post Game Carnage Reports'),
        slug: '/pgcrs',
        exact: false,
        profile: true,
        primary: true
      },
      {
        name: t('Sit Rep'),
        desc: t('Be more aware of your surroundings, Guardian'),
        slug: '/sit-rep',
        exact: true,
        profile: true,
        primary: true
      },
      {
        name: t('More'),
        desc: t('Prestigious records and valued items up for grabs this week'),
        slug: '/',
        exact: true,
        profile: false,
        primary: true,
        hidden: true
      },
      {
        name: <span className='destiny-settings' />,
        desc: 'Theme, collectibles, language',
        slug: '/settings',
        exact: true,
        primary: true
      },
      {
        name: t('Leaderboards'),
        desc: t('How committed are you to protecting your legacy'),
        slug: '/leaderboards',
        exact: false,
        profile: false
      },
      {
        name: t('Experiments'),
        desc: t("Where I keep all of my crazy ideas"),
        slug: '/experiments',
        exact: false,
        profile: false
      },
      // {
      //   name: t('FAQ'),
      //   desc: t('Answers to common queries in a mostly well-written and organised format'),
      //   slug: '/faq',
      //   exact: false,
      //   profile: false
      // },
      {
        name: t('Credits'),
        desc: t('The Architects and Guardians that make Braytech possible'),
        slug: '/credits',
        exact: false,
        profile: false
      }
    ];

    let viewsInline = false;
    if (viewport.width >= 1360) {
      viewsInline = true;
    }

    let profileRoute = route.location.pathname.match(/\/(?:[1|2|4])\/(?:[0-9]+)\/(?:[0-9]+)/);
    let profileRouteView = route.location.pathname.match(/\/(?:[1|2|4])\/(?:[0-9]+)\/(?:[0-9]+)\/(\w+)/);
    let profileView = profileRouteView ? profileRouteView[1] : false;

    let profileEl = null;

    let isActive = (match, location) => {
      if (match) {
        return true;
      } else {
        return false;
      }
    };

    if (profileRoute && member.data) {
      const characterId = member.characterId;
      const profile = member.data.profile.profile.data;
      const characters = member.data.profile.characters.data;
      const characterProgressions = member.data.profile.characterProgressions.data;

      const character = characters.find(character => character.characterId === characterId);

      const capped = characterProgressions[character.characterId].progressions[1716568313].level === characterProgressions[character.characterId].progressions[1716568313].levelCap ? true : false;

      const emblemDefinition = manifest.DestinyInventoryItemDefinition[character.emblemHash];

      const progress = capped ? characterProgressions[character.characterId].progressions[2030054750].progressToNextLevel / characterProgressions[character.characterId].progressions[2030054750].nextLevelAt : characterProgressions[character.characterId].progressions[1716568313].progressToNextLevel / characterProgressions[character.characterId].progressions[1716568313].nextLevelAt;

      profileEl = (
        <div className='profile'>
          <div className={cx('background', { 'update-flash': this.state.updateFlash })}>
            <ObservedImage
              className={cx('image', 'emblem', {
                missing: emblemDefinition.redacted
              })}
              src={`https://www.bungie.net${emblemDefinition.secondarySpecial ? emblemDefinition.secondarySpecial : `/img/misc/missing_icon_d2.png`}`}
            />
          </div>
          <div className='ui'>
            <div className='characters'>
              <ul className='list'>
                <li>
                  <ObservedImage
                    className={cx('image', 'secondaryOverlay', {
                      missing: emblemDefinition.redacted
                    })}
                    src={`https://www.bungie.net${!emblemDefinition.redacted ? emblemDefinition.secondaryOverlay : `/img/misc/missing_icon_d2.png`}`}
                  />
                  <div className='displayName'>{profile.userInfo.displayName}</div>
                  <div className='basics'>
                    {character.baseCharacterLevel} / {classHashToString(character.classHash, character.genderType)} / <span className='light'>{character.light}</span>
                  </div>
                  <ProgressBar
                    classNames={{
                      capped: capped
                    }}
                    objectiveDefinition={{
                      completionValue: 1
                    }}
                    playerProgress={{
                      progress: progress
                    }}
                    hideCheck
                  />
                  <Link
                    to={{
                      pathname: '/character-select',
                      state: { from: this.props.route.location }
                    }}
                  />
                </li>
              </ul>
            </div>
            {viewsInline ? (
              <div className='views'>
                <ul>
                  {views.filter(v => v.primary).map(view => {
                    if (view.profile) {
                      return (
                        <li key={view.slug}>
                          <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact}>
                            {view.name}
                          </ProfileNavLink>
                        </li>
                      );
                    } else if (view.hidden) {
                      return (
                        <li key='more'>
                          <Link to={view.slug} onClick={e => { e.preventDefault(); this.openNav(); }}>
                            {view.name}
                          </Link>
                        </li>
                      );
                    } else {
                      return (
                        <li key={view.slug}>
                          <NavLink to={view.slug} exact={view.exact}>
                            {view.name}
                          </NavLink>
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div id='header' className={cx(this.props.theme.selected, { 'profile-header': profileEl, navOpen: this.state.mobileNavOpen })}>
        <div className='braytech'>
          <div className='logo'>
            <Link to='/' onClick={this.closeNav}>
              <span className='destiny-clovis_bray_device' />
              Braytech
            </Link>
          </div>
          {!viewsInline || this.state.navOpen ? this.navOverlayLink(this.state.navOpen) : null}
          {!profileEl && viewsInline && !this.state.navOpen ? (
            <div className='ui'>
              <div className='views'>
                <ul>
                  {views.filter(v => v.primary).map(view => {
                    if (view.profile && !view.secondary) {
                      return (
                        <li key={view.slug}>
                          <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact}>
                            {view.name}
                          </ProfileNavLink>
                        </li>
                      );
                    } else if (view.hidden) {
                      return (
                        <li key='more'>
                          <Link to={view.slug} onClick={e => { e.preventDefault(); this.openNav(); }}>
                            {view.name}
                          </Link>
                        </li>
                      );
                    } else {
                      return (
                        <li key={view.slug}>
                          <NavLink to={view.slug} exact={view.exact}>
                            {view.name}
                          </NavLink>
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
        {profileEl}
        {this.state.navOpen ? (
          <div className='nav' ref={this.navEl}>
            <div className='wrap'>
              <div className='types'>
                <div className='type progression'>
                  <ul>
                    {views.filter(v => v.primary && !v.hidden).map(view => {
                      if (view.profile) {
                        return (
                          <li key={view.slug}>
                            <div className='name'>{view.name}</div>
                            <div className='description'>{view.desc}</div>
                            <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact} onClick={this.closeNav} />
                          </li>
                        );
                      } else {
                        return (
                          <li key={view.slug}>
                            <div className='name'>{view.name}</div>
                            <div className='description'>{view.desc}</div>
                            <NavLink to={view.slug} exact={view.exact} onClick={this.closeNav} />
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
                <div className='type ancillary'>
                  <ul>
                    {views.filter(v => !v.primary).map(view => {
                      if (view.profile) {
                        return (
                          <li key={view.slug}>
                            <div className='name'>{view.name}</div>
                            <div className='description'>{view.desc}</div>
                            <ProfileNavLink to={view.slug} isActive={isActive} exact={view.exact} onClick={this.closeNav} />
                          </li>
                        );
                      } else {
                        return (
                          <li key={view.slug}>
                            <div className='name'>{view.name}</div>
                            <div className='description'>{view.desc}</div>
                            <NavLink to={view.slug} exact={view.exact} onClick={this.closeNav} />
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              </div>
              <Footer minimal linkOnClick={this.closeNav} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme,
    viewport: state.viewport
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Header);
