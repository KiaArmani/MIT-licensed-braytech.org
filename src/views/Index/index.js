import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import Moment from 'react-moment';
import cx from 'classnames';

import { ProfileLink } from '../../components/ProfileLink';
import ObservedImage from '../../components/ObservedImage';
import Button from '../../components/UI/Button';
import captainsLog from '../../data/captainsLog';
import { ReactComponent as Logo } from '../../components/BraytechDevice.svg';
import { ReactComponent as Patreon } from '../../components/PatreonDevice.svg';
import manifest from '../../utils/manifest';
import './styles.css';

class Index extends React.Component {
  constructor() {
    super();
    this.state = {
      slogan: Math.floor(Math.random() * (2 - 0 + 1)) + 0,
      log: 0
    };
    this.logs = captainsLog.slice().reverse();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  logPrevious = e => {
    if (this.state.log + 1 === this.logs.length) {
      return;
    }
    this.setState(prev => ({
      log: prev.log + 1
    }));
  };

  logNext = e => {
    if (this.state.log === 0) {
      return;
    }
    this.setState(prev => ({
      log: prev.log - 1
    }));
  };

  render() {
    return (
      <div className='view' id='index'>
        <div className='module intro'>
          <div className='device'>
            <Logo />
          </div>
          <div className='content'>
            <div className='name'>BRAYTECH</div>
            <div className='description'>
              <p>Braytech is a Destiny fan site that allows users to view and map checklists, track and view triumphs, inspect collectibles, and so much more.</p>
              <p>The name, Braytech, is that which Clovis Bray, one of several of the franchises' fictional entities, designates their consumer products line; weapons, armour, etc.</p>
              <p>Braytech is a stringent exercise in game UI mimicry and quality over quantity. Additionally, it’s a learning exercise for the developer in terms of new technology and acting on user feedback.</p>
            </div>
          </div>
        </div>
        {manifest.statistics.general ? (
          <div className='module stats'>
            <div className='content'>
              <ul>
                <li>
                  <div className='value'>{manifest.statistics.general.tracking.toLocaleString('en-us')}</div>
                  <div className='name'>Tracked players</div>
                  <div className='description'>
                    <p>Number of players VOLUSPA is tracking through their activities and accomplishments</p>
                  </div>
                </li>
                <li>
                  <div className='value'>{manifest.statistics.general.groups.toLocaleString('en-us')}</div>
                  <div className='name'>Tracked clans</div>
                  <div className='description'>
                    <p>Number of clans that tracked players identify with</p>
                  </div>
                </li>
                {/* <li>
                  <div className='value'>{manifest.statistics.general.playedReset.toLocaleString('en-us')}</div>
                  <div className='name'>Played reset</div>
                  <div className='description'>
                    <p>Number of tracked players who've played this week</p>
                  </div>
                </li> */}
                <li>
                  <div className='value'>{manifest.statistics.general.playedSeason.toLocaleString('en-us')}</div>
                  <div className='name'>Played season</div>
                  <div className='description'>
                    <p>Number of tracked players who've played this season</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
        <div className='module'>
          <div className='width-wrap'>
            <div className='content patreon'>
              <div className='icon'>
                <Patreon />
              </div>
              <div className='text'>
                <div className='sub-header'>
                  <div>Patreon</div>
                </div>
                <div className='name'>Support through Patreon</div>
                <div className='description'>
                  <p>Building these beautiful interfaces and fencing with Bungie's APIs takes effort and time. I can only devote so much of it to hobby ventures, which also cost money to keep online. I have a firm stance against ads on web sites as we know them. As such, I prefer to support these projects out of my own pocket and depend on the generosity of my community.</p>
                  <p>By supporting me, you can help ensure that I can keep these projects online, as well as help enable me to continue adding cool new features.</p>
                </div>
                <Button
                  lined
                  text='Become a Patron'
                  action={() => {
                    window.open('https://www.patreon.com/braytech', '_blank');
                  }}
                />
              </div>
            </div>
            <div className='content change-log'>
              <div className='sub-header'>
                <div>Change log</div>
              </div>
              <div className='log-state'>
                <div className='meta'>
                  <div className='number'>
                    <span>
                      Version <span>{this.logs[this.state.log].version}</span>
                    </span>
                  </div>
                  <div className='time'>
                    <Moment fromNow>{this.logs[this.state.log].date}</Moment>
                  </div>
                </div>
                <div className='buttons'>
                  <Button lined text={<span className='destiny-arrow_left' />} action={this.logPrevious} disabled={this.state.log + 1 === this.logs.length ? true : false} />
                  <Button lined text={<span className='destiny-arrow_right' />} action={this.logNext} disabled={this.state.log === 0 ? true : false} />
                </div>
              </div>
              <ReactMarkdown className='log-content' source={this.logs[this.state.log].content} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

export default compose(connect(mapStateToProps))(Index);
