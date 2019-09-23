import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';

import './styles.css';

class FAQ extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { t } = this.props;

    let qa = [
      {
        k: 'api',
        q: 'Braytech says I have completed `X` raids, but I\'ve actually completed `Y` raids?',
        a: 'Raid stats are complicated and can differ between raids themselves. This is my initial attempt at displaying raid stats based on PGCRs. Raid.report operates on similar principles but have it refined into a precise art.\n\n~~Raid stats under the _Legend_ view count only full clears. Counting full clears, again, appears to differ between raids and I\'m still learning.~~Now shows all clears irrespective of checkpoints etc. Stats which I do feel are reliable are fastest full clear and flawless runs.\n\nWhen it comes to stats probably anywhere in life, they should never be taken at face value. Some understanding about the context and source is recommended.'
      },
      {
        k: 'api',
        q: 'Why isn\'t there a _Clan Stats_ view anymore?',
        a: 'The data source for the _Clan Stats_ view is unreliable and inaccurate—for the indoctrinated, I\'m referring to the HistoricalStats endpoint and how it is sometimes inaccruate both in represensation and the more literal sense—so I\'ve made the decision that it\'s better to have no data than to have potentially erroneous data.\n\nThe alternative source of for data is loading PGCRs for every player and for every activity I wish to calculate statistics for. Needless to say, this isn\'t feasible in a client-side web app.\n\nClient-side web app? Braytech doesn\'t rely on a server-side component like Raid.report, Charlemagne, or Destiny Tracker do.\n\nIdeally, I\'d fetch summary data for each player from Charlemagne but apparently she\'s at her technical limits for the time being.'
      },
      {
        k: 'api',
        q: 'Why isn\'t there a _Vendors_ view anymore?',
        a: 'Vendor data requires OAuth—the process you undergo when a web site requests access to your data and you are requried to approve or deny in order to continue—and I was using some server-side programming to mirror the vendor sales my own character sees on Braytech.\n\nPitfalls include:\n - items disappearing when I collect them\n- Warlock only armour items\n- sometimes frail in reliability\n- overlap with the better functions of other apps such as DIM'
      },
      {
        k: 'braytech',
        q: 'Braytech won\'t update to the newest version?',
        a: 'Follow these steps carefully for Google Chrome desktop (other browsers idk I\'m one guy give me a break... Tweet me if you have to)\n\n1. Press F12 to open Chrome DevTools\n2. Select the Application tab in DevTools\n3. On the right side of the panel, click Unregister to unregister Braytech\'s Service Worker\n4. Close all Braytech tabs\n5. Open a Braytech tab'
      }
    ];

    return (
      <div className={cx('view')} id='faq'>
        <div className='module intro'>
          <div className='page-header'>
            <div className='name'>{t('Frequently Asked Questions')}</div>
            <div className='description'>{t('Answers to common queries in a mostly well-written and organised format.')}</div>
          </div>
        </div>
        <div className='module faq'>
          <div className='k'>
            <div>
              <div className='sticky'>Braytech</div>
            </div>
            <div>
              {qa.filter(q => q.k === 'braytech').map((qa, index) => {
                return (
                  <div key={index} className='qa'>
                    <ReactMarkdown className='q' source={qa.q} />
                    <ReactMarkdown className='a' source={qa.a} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className='k'>
            <div>
              <div className='sticky'>API data availability and accuracy</div>
            </div>
            <div>
              {qa.filter(q => q.k === 'api').map((qa, index) => {
                return (
                  <div key={index} className='qa'>
                    <ReactMarkdown className='q' source={qa.q} />
                    <ReactMarkdown className='a' source={qa.a} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='module'></div>
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
)(FAQ);
