import React from 'react';
import PropTypes from 'prop-types';
import { Fab, Icon } from '@material-ui/core';

const style = {
  opacity: '0.45',
  position: 'fixed',
  bottom: '10px',
  right: '10px',
  zIndex: '10000',
  '&:hover': {
    opacity: '1',
  },
};

class ScrollToTopButton extends React.Component {

  state = {
    intervalId: 0,
  };

  scrollStep() {
    if (window.pageYOffset === 0) {
      clearInterval(this.state.intervalId);
    }
    window.scroll(0, window.pageYOffset - this.props.scrollStepInPx);
  }

  scrollToTop() {
    const intervalId = setInterval(
      this.scrollStep.bind(this),
      this.props.delayInMs,
    );
    this.setState({ intervalId });
  }

  render() {

    return (
      <Fab
        color="primary"
        aria-label="Back to the top"
        title="Back to the top"
        style={style}
        onClick={() => {
          this.scrollToTop();
        }}
      >
        <Icon>arrow_upward</Icon>
      </Fab>
    );
  }
}

ScrollToTopButton.propTypes = {
  // offset to scroll to
  scrollStepInPx: PropTypes.number.isRequired,
  // delay in ms from click to actual action of scrolling up
  delayInMs: PropTypes.number.isRequired,
};

export default ScrollToTopButton;
