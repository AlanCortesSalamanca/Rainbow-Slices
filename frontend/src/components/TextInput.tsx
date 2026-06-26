import type { InputHTMLAttributes } from 'react';
import './Inputs.css';

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: TextInputProps) {
  return <input className="input" type="text" {...props} />;
}
