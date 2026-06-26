import type { InputHTMLAttributes } from 'react';
import './Inputs.css';

type NumberInputProps = InputHTMLAttributes<HTMLInputElement>;

export function NumberInput(props: NumberInputProps) {
  return <input className="input" type="number" {...props} />;
}
