import React from 'react';
import { ErrorCard } from './ErrorCard';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = (props) => {
  return <ErrorCard {...props} />;
};

export { ErrorCard };
