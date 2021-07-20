import { render, screen } from '@testing-library/react';
import SampleApp from './SampleApp';

xtest('renders learn react link', () => {
  render(<SampleApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
