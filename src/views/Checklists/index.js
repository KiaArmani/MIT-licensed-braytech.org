/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import cx from 'classnames';

import './styles.css';

import ChecklistFactory from './ChecklistFactory';

function getItemsPerPage(width) {
  if (width >= 2000) return 5;
  if (width >= 1600) return 4;
  if (width >= 1200) return 3;
  if (width >= 800) return 2;
  return 1;
}

const ListButton = p => (
  <li key={p.name} className='linked'>
    <a
      className={cx({
        active: p.visible
      })}
      onClick={p.onClick}
    >
      <div className={p.icon} />
      <div className='name'>{p.name}</div>
    </a>
  </li>
);

ListButton.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  visible: PropTypes.bool
};

export class Checklists extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      itemsPerPage: getItemsPerPage(props.viewport.width)
    };
  }

  componentDidUpdate(prev) {
    const newWidth = this.props.viewport.width;
    if (prev.viewport.width !== newWidth) {
      this.setState({ itemsPerPage: getItemsPerPage(newWidth) });
    }
  }

  changeSkip = index => {
    this.setState({
      page: Math.floor(index / this.state.itemsPerPage)
    });
  };

  render() {
    const { t, member, collectibles, theme } = this.props;
    const { page, itemsPerPage } = this.state;

    const f = new ChecklistFactory(t, member.data.profile, member.characterId, collectibles.hideChecklistItems);

    const lists = [
      f.regionChests(), //
      f.lostSectors(),
      f.adventures(),
      f.corruptedEggs(),
      f.amkaharaBones(),
      f.catStatues(),
      f.sleeperNodes(),
      f.ghostScans(),
      f.latentMemories(),
      f.ghostStories(),
      f.awokenOfTheReef(),
      f.forsakenPrince()
    ];

    if (Object.values(member.data.profile.profileProgression.data.checklists[2448912219]).filter(i => i).length === 4) {
      lists.push(f.caydesJournals());
    }

    let sliceStart = parseInt(page, 10) * itemsPerPage;
    let sliceEnd = sliceStart + itemsPerPage;

    const visible = lists.slice(sliceStart, sliceEnd);

    return (
      <div className={cx('view', theme.selected)} id='checklists'>
        <div className='views'>
          <div className='sub-header sub'>
            <div>Checklists</div>
          </div>
          <ul className='list'>
            {lists.map((list, i) => (
              <ListButton name={list.name} icon={list.icon} key={i} visible={visible.includes(list)} onClick={() => this.changeSkip(i)} />
            ))}
          </ul>
        </div>
        <div className={cx('lists', 'col-' + this.state.itemsPerPage)}>
          {visible.map(list => (
            <div className='col' key={list.name}>
              {list.checklist}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
Checklists.propTypes = {
  member: PropTypes.object.isRequired,
  collectibles: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  viewport: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    collectibles: state.collectibles,
    theme: state.theme,
    viewport: state.viewport
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Checklists);
