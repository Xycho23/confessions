import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface IconWrapperProps extends Omit<IconProps, 'as'> {
  icon: IconType;
}

export const IconWrapper = React.forwardRef<HTMLElement, IconWrapperProps>(
  ({ icon: IconComponent, ...props }, ref) => {
    return <Icon ref={ref} as={IconComponent as any} {...props} />;
  }
);
