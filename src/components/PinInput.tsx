import React from 'react';
import {
  HStack,
  PinInput as ChakraPinInput,
  PinInputField,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';

interface CustomPinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  error?: string;
  label?: string;
}

export const CustomPinInput: React.FC<CustomPinInputProps> = ({
  value,
  onChange,
  onComplete,
  error,
  label,
}) => {
  return (
    <FormControl isInvalid={!!error}>
      {label && <FormLabel fontSize="sm">{label}</FormLabel>}
      <HStack justify="center">
        <ChakraPinInput
          value={value}
          onChange={onChange}
          onComplete={onComplete}
          type="number"
          mask
        >
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </ChakraPinInput>
      </HStack>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
