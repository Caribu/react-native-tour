import React from 'react';
import { Provider } from './context';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  highlight: {
    backgroundColor: 'white',
    zIndex: 20,
    position: 'absolute',
  },
});

export default class OnboardingProvider extends React.Component {
  constructor({ steps, initialStep }) {
    super();
    this.state = { positions: {}, step: initialStep, steps };
  }
  render() {
    const { highlightComponent, centerStyle } = this.props;
    const OverlayWrapper = highlightComponent || View;

    const { step, steps, positions, hideOverlay } = this.state;
    let activeStep = steps[step] || {};
    const { style, overlay, center } = positions[activeStep.name] || {};
    // if the active step isnt on screen yet, we cant try to render anything
    if (!style || step === null) activeStep = {};

    const next = async (data = {}) => {
      const { hideOverlay, trigger } = data;
      if (trigger) trigger();

      if (step === null) return;

      const nextStep = steps[step + 1];
      if (nextStep && nextStep.beforeStep) await nextStep.beforeStep();

      this.setState({
        hideOverlay,
        step: steps[step + 1] ? step + 1 : null,
      });
    };

    return (
      <Provider
        value={{
          next,
          nextStep: steps[step + 1] || {},
          previousStep: steps[step - 1] || {},
          step: steps[step] ? steps[step] : {},
          start: async () => {
            if (step || step === 0) return;

            const step = steps[0];
            if (step && step.beforeStep) await step.beforeStep();

            this.setState({ step: 0 });
          },
          onLayout: (name, data) =>
            step === null
              ? null
              : this.setState({
                  positions: { [name]: data },
                  hideOverlay: false,
                }),
          setActive: stepName =>
            this.setState({
              step: steps.findIndex(row => row.name === stepName),
            }),
        }}
      >
        <View style={styles.container}>
          {this.props.children}
          {(step || step === 0) && !hideOverlay ? (
            <View style={styles.overlay}>
              {activeStep.name ? (
                <React.Fragment>
                  {overlay ? (
                    <OverlayWrapper style={[styles.highlight, style]}>
                      {overlay}
                    </OverlayWrapper>
                  ) : null}
                  <View
                    style={
                      overlay && !center
                        ? { top: style.top, left: style.left }
                        : centerStyle || {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }
                    }
                  >
                    {React.createElement(activeStep.component, {
                      currentStep: step + 1,
                      totalSteps: steps.length,
                      next,
                      close: () => this.setState({ step: null }),
                    })}
                  </View>
                </React.Fragment>
              ) : null}
            </View>
          ) : null}
        </View>
      </Provider>
    );
  }
}