import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Animated,
  Easing,
  Text,
  View,
} from 'react-native';

const INDETERMINATE_WIDTH_FACTOR = 0.3;
const BAR_WIDTH_ZERO_POSITION = INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR);

export default class ProgressBar extends Component {
  static propTypes = {
    animated: PropTypes.bool,
    borderColor: PropTypes.string,
    borderRadius: PropTypes.number,
    borderWidth: PropTypes.number,
    color: PropTypes.string,
    height: PropTypes.number,
    indeterminate: PropTypes.bool,
    progress: PropTypes.number,
    unfilledColor: PropTypes.string,
    width: PropTypes.number,
    innerBarTitle: PropTypes.string,
    innerBarTitleStyle: Text.propTypes.style,
    innerBarRadius: PropTypes.number
  };

  static defaultProps = {
    animated: true,
    borderRadius: 4,
    borderWidth: 1,
    color: 'rgba(0, 122, 255, 1)',
    height: 6,
    indeterminate: false,
    progress: 0,
    width: 150,
  };

  constructor(props) {
    super(props);
    const progress = Math.min(Math.max(props.progress, 0), 1);
    this.state = {
      progress: new Animated.Value(props.indeterminate ? INDETERMINATE_WIDTH_FACTOR : progress),
      animationValue: new Animated.Value(BAR_WIDTH_ZERO_POSITION),
    };
  }

  componentDidMount() {
    if (this.props.indeterminate) {
      this.animate();
    }
  }

  componentWillReceiveProps(props) {
    if (props.indeterminate !== this.props.indeterminate) {
      if (props.indeterminate) {
        this.animate();
      } else {
        Animated.spring(this.state.animationValue, {
          toValue: BAR_WIDTH_ZERO_POSITION,
        }).start();
      }
    }
    if (props.indeterminate !== this.props.indeterminate || props.progress !== this.props.progress) {
      const progress = (props.indeterminate ? INDETERMINATE_WIDTH_FACTOR : Math.min(Math.max(props.progress, 0), 1));

      if (props.animated) {
        Animated.spring(this.state.progress, {
          toValue: progress,
          bounciness: 0,
        }).start();
      } else {
        this.state.progress.setValue(progress);
      }
    }
  }

  animate() {
    this.state.animationValue.setValue(0);
    Animated.timing(this.state.animationValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      isInteraction: false,
    }).start(endState => {
      if (endState.finished) {
        this.animate();
      }
    });
  }

  render() {
    const {
      borderColor,
      borderRadius,
      borderWidth,
      children,
      color,
      height,
      indeterminate,
      style,
      unfilledColor,
      width,
      ...restProps,
    } = this.props;

    const innerWidth = width - borderWidth * 2;
    const containerStyle = {
      flexDirection: 'row',
      justifyContent: 'center',
      width,
      borderWidth,
      borderColor: borderColor || color,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: unfilledColor,
    };
    const progressStyle = {
      backgroundColor: color,
      justifyContent: 'center',
      height,
      width: this.state.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, innerWidth],
      }),
      transform: [{
        translateX: this.state.animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [innerWidth * -INDETERMINATE_WIDTH_FACTOR, innerWidth],
        }),
      }],
    };

    return (
      <View style={[containerStyle, style]} {...restProps}>
        <Animated.View style={[progressStyle, {borderRadius: this.props.innerBarRadius}]}>
          {this.props.innerBarTitle ? <Text style={[{color: 'white', alignSelf: 'flex-end', marginRight: 5}, this.props.innerBarTitleStyle]}>{this.props.innerBarTitle}</Text> : null}
        </Animated.View>
        {children}
      </View>
    );
  }
}
