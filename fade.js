import React, { Component } from 'react';
import { Animated } from 'react-native';

export default class FadeInView extends Component {
  constructor() {
    super();

    this.state = {
      viewOpacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const { viewOpacity } = this.state;
    const { duration = 300 } = this.props;

    Animated.timing(viewOpacity, {
      toValue: 1,
      duration,
    }).start(() => {});
  }

  render() {
    const { viewOpacity } = this.state;

    return (
      <Animated.View style={{ opacity: viewOpacity }}>
        {this.props.children}
      </Animated.View>
    );
  }
}
