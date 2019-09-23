import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';

import './styles.css';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    let classNames = this.props.classNames;
    let checked = this.props.completed || this.props.checked;
    let text = this.props.text;
    let linked = this.props.linked;

    return (
      <div className={cx('check-box', classNames, { checked: checked, linked: linked }, this.props.theme.selected)}>
        <div className={cx('check', { ed: checked })} />
        <div className='text'>{text}</div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme
  };
}

export default compose(connect(mapStateToProps))(Checkbox);
