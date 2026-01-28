import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText(/enter text/i);
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText(/disabled/i)).toBeDisabled();
  });

  it('renders with icon', () => {
    const Icon = () => <span data-testid="input-icon">🔍</span>;
    render(<Input icon={<Icon />} />);
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });
});
