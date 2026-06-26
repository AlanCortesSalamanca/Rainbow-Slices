import type { TextareaHTMLAttributes } from 'react';
import './Inputs.css';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea(props: TextAreaProps) {
  return <textarea className="input input--textarea" {...props} />;
}
