import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import { ProfileNavLink } from '../../ProfileLink';

import './styles.css';

class Mode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, member, stats, isActive = false, root = '/multiplayer/crucible', defaultMode = 5 } = this.props;

    let definition = Object.values(manifest.DestinyActivityModeDefinition).find(d => d.modeType === stats.mode);

    let definitionCompetitive = manifest.DestinyActivityDefinition[2947109551];
    let definitionQuickplay = manifest.DestinyActivityDefinition[2274172949];

    let modeName = definition.displayProperties.name;
    modeName = definition.hash === 2096553452 ? 'Lockdown' : modeName;
    modeName = definition.hash === 1164760504 ? 'All modes' : modeName;
    modeName = definition.hash === 2486723318 ? 'Competitive' : modeName;
    modeName = definition.hash === 3425110680 ? 'Quickplay' : modeName;
    modeName = modeName.replace(': ' + definitionCompetitive.displayProperties.name, '');
    modeName = modeName.replace(': ' + definitionQuickplay.displayProperties.name, '');

    let altIcons = [
      {
        modes: [5],
        pathname: '/static/images/extracts/ui/modes/01E3-00000059.PNG'
      },
      {
        modes: [4],
        pathname: '/static/images/extracts/ui/modes/01E3-00000001.PNG'
      },
      {
        modes: [69],
        pathname: '/static/images/extracts/ui/modes/01E3-00000181.PNG'
      },
      {
        modes: [70],
        pathname: '/static/images/extracts/ui/modes/01E3-00000190.PNG'
      },
      {
        modes: [72, 71, 59],
        pathname: '/static/images/extracts/ui/modes/0560-000005D0.PNG'
      },
      {
        modes: [74, 73, 60],
        pathname: '/static/images/extracts/ui/modes/01E3-000019F0.PNG'
      },
      {
        modes: [38, 37],
        pathname: '/static/images/extracts/ui/modes/01E3-0000017A.PNG'
      },
      {
        modes: [48],
        pathname: '/static/images/extracts/ui/modes/01E3-00000049.PNG'
      },
      {
        modes: [65],
        pathname: '/static/images/extracts/ui/modes/01E3-00001845.PNG'
      },
      {
        modes: [43],
        pathname: '/static/images/extracts/ui/modes/0560-00001729.PNG'
      },
      {
        modes: [63],
        pathname: '/static/images/extracts/ui/modes/01E3-000012C9.PNG'
      },
      {
        modes: [75],
        pathname: '/static/images/extracts/ui/modes/0560-00001342.PNG'
      },
      {
        modes: [76],
        pathname: '/static/images/extracts/ui/modes/0560-0000134E.PNG'
      }
    ];

    let modeIcon = `https://www.bungie.net${definition.displayProperties.icon}`;
    modeIcon = altIcons.find(m => m.modes.includes(stats.mode)) ? altIcons.find(m => m.modes.includes(stats.mode)).pathname : modeIcon;

    return (
      <li className='linked'>
        <div className='icon'>
          <ObservedImage className='image' src={modeIcon} />
        </div>
        <div className='text'>
          <div className='name'>{modeName}</div>
          {stats.killsDeathsRatio ? (
            <>
              <div className='minor-stats'>
                <div className='stat'>
                  <div className='value'>{Number.parseFloat(stats.efficiency.basic.value).toFixed(2)}</div>
                  <div className='name'>Efficiency</div>
                </div>
                <div className='stat'>
                  <div className='value'>{stats.kills.basic.value.toLocaleString('en-us')}</div>
                  <div className='name'>Kills</div>
                </div>
                <div className='stat'>
                  <div className='value'>{stats.deaths.basic.value.toLocaleString('en-us')}</div>
                  <div className='name'>Deaths</div>
                </div>
              </div>
              <div className='stat kdr'>
                <div className='value'>{Number.parseFloat(stats.killsDeathsRatio.basic.value).toFixed(2)}</div>
                <div className='name'>K/D</div>
              </div>
            </>
          ) : <div className='no-stats'><div>No stats available</div></div>}
        </div>
        <ProfileNavLink isActive={isActive} to={{ pathname: stats.mode === parseInt(defaultMode, 10) ? root : `${root}/${stats.mode}`, state: {  } }} onClick={() => {
          let element = document.getElementById('matches');
          element.scrollIntoView({behavior: "smooth"});
        }} />
      </li>
    );
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
)(Mode);
