import React, { Component } from 'react'

import {
  TextInput,
  findNodeHandle,
  NativeModules,
  Platform
} from 'react-native'

const mask = NativeModules.RNTextInputMask.mask
const unmask = NativeModules.RNTextInputMask.unmask
const setMask = NativeModules.RNTextInputMask.setMask
export { mask, unmask, setMask }

export default class TextInputMask extends Component {
  static defaultProps = {
    maskDefaultValue: true,
  }

  componentDidMount() {
    if (this.props.maskDefaultValue &&
        this.props.mask &&
        this.props.value) {
      this.synchronizeValue();
    }

    if (this.props.mask) {
      setMask(findNodeHandle(this.input), this.props.mask)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mask !== this.props.mask) {
      setMask(findNodeHandle(this.input), this.props.mask)
    }

    if (prevProps.value !== this.props.value) {
      this.synchronizeValue();
    }
  }

  synchronizeValue() {
    if (!this.props.mask || !this.props.value || !this.props.value.length) {
      return;
    }

    mask(this.props.mask, this.props.value, text => {
      if (this.input && !this.input.isFocused()) {
        this.input.setNativeProps({ text })
      }
    });
  }

  onBlur = (...args) => {
    this.synchronizeValue();

    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  }

  render() {
    return (<TextInput
      {...this.props}
      collapsable={false}
      onBlur={this.onBlur}
      value={undefined}
      ref={ref => {
        this.input = ref
        if (typeof this.props.refInput === 'function') {
          this.props.refInput(ref)
        }
      }}
      multiline={this.props.mask && Platform.OS === 'ios' ? false : this.props.multiline}
      onChangeText={masked => {
        if (this.props.mask) {
          const _unmasked = unmask(this.props.mask, masked, unmasked => {
            this.props.onChangeText && this.props.onChangeText(masked, unmasked)
          })
        } else {
          this.props.onChangeText && this.props.onChangeText(masked)
        }
      }}
    />);
  }
}
