import React from 'react';
import { requireNativeComponent, ViewProps } from 'react-native';

const NativeView = requireNativeComponent<MyNativeViewProps>('MyNativeView');

interface MyNativeViewProps extends ViewProps {
  text?: string;
}

const MyNativeView: React.FC<MyNativeViewProps> = (props) => {
  return <NativeView {...props} style={[{ width: '100%', height: 200 }, props.style]} />;
};

export default MyNativeView;
