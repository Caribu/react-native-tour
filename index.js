import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from './context';
import Fade from './fade';

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
    const { step, steps, positions } = this.state;
    let activeStep = steps[step] || {};
    const { style, overlay } = positions[activeStep.name] || {};
    // if the active step isnt on screen yet, we cant try to render anything
    if (!style) activeStep = {};

    let next = async () => {
      const nextStep = steps[step + 1];
      if (nextStep && nextStep.beforeStep) await nextStep.beforeStep();

      this.setState({
        step: steps[step + 1] ? step + 1 : null,
      });
    };

    return (
      <Provider
        value={{
          nextStep: steps[step + 1] || {},
          previousStep: steps[step - 1] || {},
          step: steps[step] ? steps[step] : {},
          start: async () => {
            const step = steps[0];

            if (step && step.beforeStep) await step.beforeStep();

            this.setState({ step: 0 });
          },
          onLayout: (name, data) =>
            this.setState({ positions: { [name]: data } }),
          setActive: stepName =>
            this.setState({
              step: steps.findIndex(row => row.name === stepName),
            }),
        }}
      >
        <View style={styles.container}>
          {this.props.children}
          {step || step === 0 ? (
            <View style={styles.overlay}>
              {activeStep.name ? (
                <Fade>
                  <View style={[styles.highlight, style]} onPress={next}>
                    {overlay}
                  </View>
                  <View style={{ top: style.top, left: style.left }}>
                    {React.createElement(activeStep.component, {
                      currentStep: step + 1,
                      totalSteps: steps.length,
                      next,
                      close: () => this.setState({ step: null }),
                    })}
                  </View>
                </Fade>
              ) : null}
            </View>
          ) : null}
        </View>
      </Provider>
    );
  }
}
