import React from 'react';
import { render } from 'react-dom';
import { Button, Backdrop, Modal, Popover } from '@patternfly/react-core';

const backdropStyle = {
  mixBlendMode: 'hard-light'
};
const backdropHighlightStyle = {
  position: 'absolute',
  backgroundColor: 'var(--pf-global--palette--black-500)'
};
const backdropBorderStyle = {
  position: 'absolute',
  border: 'var(--pf-global--BorderWidth--xl) solid var(--pf-global--palette--blue-200)',
  zIndex: 999
}

const TourModal = ({ title, text, selector, isFirst, isLast, onNext, onPrev, onClose, onSkip }) => {
  const actions = [
    <Button key="cancel" variant="primary" onClick={onNext}>
      {isLast ? 'Finish' : 'Next'}
    </Button>
  ];
  if (isFirst) {
    actions.push(
      <Button key="skip" variant="link" onClick={onSkip}>
        Skip
      </Button>
    );
  }
  else {
    actions.push(
      <Button key="confirm" variant="link" onClick={onPrev}>
        Previous
      </Button>
    );
  }

  const target = document.querySelector(selector);
  const targetBounds = target && {
    top: target.offsetTop,
    left: target.offsetLeft,
    width: target.offsetWidth,
    height: target.offsetHeight
  };
  return target ? (
    <React.Fragment>
      <Backdrop id="guidedToursBackdrop" style={backdropStyle}>
        <div style={{ ...backdropHighlightStyle, ...targetBounds }} />
      </Backdrop>
      <Popover
        isVisible
        aria-label={title}
        headerContent={title}
        bodyContent={text}
        footerContent={actions}
        reference={() => target}
        onHide={onClose}
      />
      <div style={{ ...backdropBorderStyle, ...targetBounds }} />
    </React.Fragment>
  ) : (
    <Modal variant="small" isOpen title={title} actions={actions} onClose={onClose}>
      {text}
    </Modal>
  );
}

export const TourSteps = ({ id, steps, target }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [stepNum, setStepNum] = React.useState(0);

  const finished = stepNum === steps.length;
  if (finished) {
    setComplete(id);
  }
  if (finished || !isVisible) {
    target.remove();
    return null;
  }
  return <TourModal
    isFirst={stepNum === 0}
    isLast={stepNum === steps.length - 1}
    onPrev={() => setStepNum(stepNum - 1)}
    onNext={() => setStepNum(stepNum + 1)}
    onClose={() => setIsVisible(false)}
    onSkip={() => {
      setIsVisible(false);
      setComplete(id);
    }}
    {...steps[stepNum]}
  />;
};

const divId = 'guidedTours';
export function init(tourUrl, forceShow) {
  fetch(tourUrl)
    .then(res => res.json())
    .then(({ steps, id }) => {
      if (!getComplete(id) || forceShow) {
        const target = document.createElement('div');
        target.id = divId;
        document.body.append(target);
        render(<TourSteps id={id} steps={steps} target={target} />, target);
      }
    });
}

export const setIncomplete = id => window.localStorage.removeItem(id);
export const setComplete = id => window.localStorage.setItem(id, 'true');
export const getComplete = id => window.localStorage.getItem(id) === 'true';

