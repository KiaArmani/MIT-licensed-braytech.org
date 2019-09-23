import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import ObservedImage from '../../components/ObservedImage';

import './styles.css';

class Resources extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { t } = this.props;

    let tools = [
      {
        name: 'Clan Banner Builder',
        icon: 'destiny-clan_banner',
        description: "Collaborate with clan members on a new clan banner. Selecting different options instantly updates the page's URL, which allows you to easily share your customisations.",
        author: 'Braytech',
        link: '/experiments/clan-banner-builder'
      },
      {
        name: 'Legend',
        icon: 'destiny-destiny',
        description: "A high-level and more graphical overview of your achievements: A small step in a very different direction, this was something fun I made. It was also my first time loading PGCRs to calculate statistics.",
        author: 'Braytech',
        link: '/legend'
      },
      {
        name: 'Data Inspector',
        icon: 'destiny-road_kill',
        description: "A simple tree view approach to browsing through Destiny's manifest. Like data.destinysets.com, but less useful. I should probably at least add a filter input.",
        author: 'Braytech',
        link: '/experiments/data-inspector'
      }
    ];

    return (
      <div className={cx('view', this.props.theme.selected)} id='experiments'>
        <div className='module head'>
          <div className='page-header'>
            <div className='name'>{t('Experiments')}</div>
          </div>
          <div className='text'>
            <p>Expect unfinished crap.</p>
            <p>Sometimes, it's nice to try new and whacky ideas out. This is a space just for that. Previously, experiments would appear as secondary features, that would come and go. This is a place for them to live out their lives in peace.</p>
          </div>
        </div>
        <div className='module'>
          <div className='tools'>
            {tools.map((tool, index) => {
              let jsx = (
                <>
                  <div className='icon'>
                    <span className={tool.icon} />
                  </div>
                  <div className='text'>
                    <div className='name'>{tool.name}{tool.author !== 'Braytech' ? <span className="destiny-external" /> : null}</div>
                    <div className='author'>{tool.author}</div>
                    <div className='description'>
                      <p>{tool.description}</p>
                    </div>
                  </div>
                </>
              );
              return (
                <div key={index} className='tool'>
                  {tool.author === 'Braytech' ? (
                    <Link to={tool.link} children={jsx} />
                  ) : (
                    <a href={tool.link} target='_blank' rel='noreferrer noopener'>
                      {jsx}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Resources);
