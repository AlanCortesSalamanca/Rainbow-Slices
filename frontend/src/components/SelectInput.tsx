import type { SelectHTMLAttributes } from 'react';
import './Inputs.css';

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement>;

export function SelectInput(props: SelectInputProps) {
  return <select className="input" {...props} />;
}
