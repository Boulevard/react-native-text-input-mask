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

    this.updateMask();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mask !== this.props.mask) {
      this.updateMask();
    }

    if (prevProps.value !== this.props.value) {
      this.synchronizeValue();
    }
  }

  updateMask() {
    if (this.input && this.props.mask) {
      setMask(findNodeHandle(this.input), this.props.mask);
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

  onInput = ref => {
    this.input = ref;

    typeof this.props.refInput === 'function' && this.props.refInput(ref);

    this.updateMask();
    this.synchronizeValue();
  }

  onBlur = (...args) => {
    this.synchronizeValue();

    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  }

  onChangeText = masked => {
    if (this.props.value === masked) {
      return;
    }

    if (!this.props.mask) {
      this.props.onChangeText && this.props.onChangeText(masked, masked);
      return;
    }

    unmask(this.props.mask, masked, unmasked => {
      this.props.onChangeText && this.props.onChangeText(masked, unmasked);
    });
  }

  render() {
    return (<TextInput
      {...this.props}
      collapsable={false}
      onBlur={this.onBlur}
      value={undefined}
      ref={this.onInput}
      multiline={this.props.mask && Platform.OS === 'ios' ? false : this.props.multiline}
      onChangeText={this.onChangeText}
    />);
  }
}
