import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';

import './styles.css';

class Button extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { classNames, text, children, action, invisible, disabled, lined, anchor } = this.props;
    const theme = this.props.themeOverride || this.props.theme.selected;

    if (anchor) {
      return (
        <Link
          className={cx('button', classNames, { lined: lined, disabled: disabled, invisible: invisible }, theme)}
          onClick={e => {
            if (action) {
              action(e);
            }
          }}
          to={this.props.to}
        >
          {text ? <div className='text'>{text}</div> : children}
        </Link>
      );
    } else {
      return (
        <button
          className={cx('button', classNames, { lined: lined, disabled: disabled, invisible: invisible }, theme)}
          onClick={e => {
            if (action) {
              action(e);
            }
          }}
          to={this.props.to}
        >
          {text ? <div className='text'>{text}</div> : children}
        </button>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme
  };
}

export default compose(connect(mapStateToProps))(Button);
