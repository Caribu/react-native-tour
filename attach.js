import React from 'react';
import { View } from 'react-native';
import { Consumer } from './context';

export default class Attach extends React.Component {
  render() {
    const { name, children, style } = this.props;
    if (!name) return children;
    if (!style) style = () => ({});

    return (
      <Consumer>
        {({ onLayout, step }) => {
          return step.name === name ? (
            <View
              ref={ref => {
                this.marker = ref;
              }}
              onLayout={() =>
                setTimeout(
                  () =>
                    this.marker.measure((x, y, width, height, pageX, pageY) => {
                      const circleSize = height > width ? height : width;

                      onLayout(name, {
                        style: {
                          // make sure the highlight is always a circle
                          height: circleSize,
                          width: circleSize,
                          top: pageY,
                          left: pageX,
                          borderRadius: circleSize,
                          ...style({ height, width, pageX, pageY, x, y }),
                        },
                        overlay: children,
                      });
                    }),
                  step.beforeDelay || 0,
                )
              }
            >
              {children}
            </View>
          ) : (
            children
          );
        }}
      </Consumer>
    );
  }
}
