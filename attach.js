import React from 'react';
import { View } from 'react-native';
import { Consumer } from './context';

let timer;

export default class Attach extends React.Component {
  render() {
    const { name, children, style, viewStyle } = this.props;
    if (!name) return children;

    return (
      <Consumer>
        {({ onLayout, step }) => {
          return step.name === name ? (
            <View
              ref={ref => {
                this.marker = ref;
              }}
              style={viewStyle}
              onLayout={() => {
                // make sure we only render the tour
                // after elements stop moving, ex route transition

                timer = setInterval(
                  () =>
                    this.marker &&
                    this.marker.measure((x, y, width, height, pageX, pageY) => {
                      if (
                        this.x === x &&
                        this.y === y &&
                        this.pageX === pageX &&
                        this.pageY === pageY
                      )
                        clearInterval(timer);
                      else {
                        this.x = x;
                        this.y = y;
                        this.pageX = pageX;
                        this.pageY = pageY;
                        return;
                      }

                      const circleSize = height > width ? height : width;

                      onLayout(name, {
                        style: {
                          // make sure the highlight is always a circle
                          height: circleSize,
                          width: circleSize,
                          top: pageY,
                          left: pageX,
                          borderRadius: circleSize,
                          ...(style
                            ? style({ height, width, pageX, pageY, x, y })
                            : {}),
                        },
                        overlay: children,
                      });
                    }),
                  250,
                );
              }}
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
