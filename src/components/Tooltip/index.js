import React from 'react';
import { connect } from 'react-redux';

import './styles.css';
import ItemTypes from './itemTypes';

class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hash: false,
      itemInstanceId: false,
      itemState: false,
      rollNote: false,
      table: false,
      tooltipType: false
    };

    this.props.onRef(this);

    this.tooltip = React.createRef();
    this.touchMovement = false;
    this.mouseMoveXY = {
      x: 0,
      y: 0
    };
  }

  mouseMove = e => {
    let x = 0;
    let y = 0;
    let offset = 0;
    let tooltipWidth = 384;
    let tooltipHeight = this.state.hash ? this.tooltip.current.clientHeight : 0;
    let scrollbarAllowance = 24;

    x = e.clientX;
    y = e.clientY + offset;

    if (x + tooltipWidth + scrollbarAllowance > window.innerWidth) {
      x = x - tooltipWidth - offset;
    } else {
      x = x + offset;
    }

    if (y + tooltipHeight + scrollbarAllowance > window.innerHeight) {
      y = window.innerHeight - tooltipHeight - scrollbarAllowance;
    }
    y = y < 0 ? 0 : y;

    if (this.state.hash) {
      this.mouseMoveXY = {
        x,
        y
      };
      this.tooltip.current.style.cssText = `top: ${y}px; left: ${x}px`;
    }
  };

  target_mouseEnter = e => {
    if (e.currentTarget.dataset.itemhash) {
      this.setState({
        hash: e.currentTarget.dataset.itemhash,
        itemInstanceId: e.currentTarget.dataset.iteminstanceid,
        itemState: e.currentTarget.dataset.itemstate,
        rollNote: e.currentTarget.dataset.rollnote ? true : false,
        table: e.currentTarget.dataset.table ? e.currentTarget.dataset.table : false,
        tooltipType: e.currentTarget.dataset.tooltiptype && e.currentTarget.dataset.tooltiptype !== '' ? e.currentTarget.dataset.tooltiptype : false
      });
    }
  };

  target_mouseLeave = e => {
    this.setState({
      hash: false,
      itemInstanceId: false,
      itemState: false,
      rollNote: false,
      table: false,
      tooltipType: false
    });
  };

  target_touchStart = e => {
    this.touchMovement = false;
  };

  target_touchMove = e => {
    this.touchMovement = true;
  };

  target_touchEnd = e => {
    if (!this.touchMovement) {
      if (e.currentTarget.dataset.itemhash) {
        this.setState({
          hash: e.currentTarget.dataset.itemhash,
          itemInstanceId: e.currentTarget.dataset.iteminstanceid,
          itemState: e.currentTarget.dataset.itemstate,
          rollNote: e.currentTarget.dataset.rollnote ? true : false,
          table: e.currentTarget.dataset.table ? e.currentTarget.dataset.table : false,
          tooltipType: e.currentTarget.dataset.tooltiptype && e.currentTarget.dataset.tooltiptype !== '' ? e.currentTarget.dataset.tooltiptype : false
        });
      }
    }
  };

  target_bindings = () => {
    let targets = document.querySelectorAll('.tooltip');
    targets.forEach(target => {
      target.addEventListener('mouseenter', this.target_mouseEnter);
      target.addEventListener('mouseleave', this.target_mouseLeave);
      target.addEventListener('touchstart', this.target_touchStart);
      target.addEventListener('touchmove', this.target_touchMove);
      target.addEventListener('touchend', this.target_touchEnd);
    });
  };

  tooltip_touchStart = e => {
    this.touchMovement = false;
  };

  tooltip_touchMove = e => {
    this.touchMovement = true;
  };

  tooltip_touchEnd = e => {
    e.preventDefault();
    if (!this.touchMovement) {
      this.setState({
        hash: false,
        itemInstanceId: false,
        itemState: false,
        rollNote: false,
        table: false,
        tooltipType: false
      });
    }
  };

  tooltip_bindings = () => {
    this.tooltip.current.addEventListener('touchstart', this.tooltip_touchStart);
    this.tooltip.current.addEventListener('touchmove', this.tooltip_touchMove);
    this.tooltip.current.addEventListener('touchend', this.tooltip_touchEnd);
  };

  componentDidUpdate(prevProps) {
    if (this.props.location && prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        hash: false,
        itemInstanceId: false,
        itemState: false,
        rollNote: false,
        table: false,
        tooltipType: false
      });
      this.target_bindings();
    }

    if (this.props.member.data !== prevProps.member.data) {
      this.target_bindings();
    }

    if (this.state.hash) {
      this.tooltip_bindings();
    }
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.mouseMove);
    this.props.onRef(this);
    this.target_bindings();
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.mouseMove);
    this.props.onRef(undefined);
  }

  render() {
    if (this.state.hash) {
      return (
        <div id='tooltip' ref={this.tooltip} style={{ top: `${this.mouseMoveXY.y}px`, left: `${this.mouseMoveXY.x}px` }}>
          <ItemTypes 
            hash={this.state.hash} 
            itemInstanceId={this.state.itemInstanceId} 
            itemState={this.state.itemState} 
            rollNote={this.state.rollNote} 
            table={this.state.table} 
            tooltipType={this.state.tooltipType} 
            />
        </div>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Tooltip);
