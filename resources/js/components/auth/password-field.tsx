import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import TextField, { FieldProps } from './text-field';

export default function PasswordField(props: Omit<FieldProps, 'type' | 'trailing'>) {
    const [show, setShow] = useState(false);
    return (
        <TextField
            {...props}
            type={show ? 'text' : 'password'}
            trailing={
                <button
                    type="button"
                    aria-pressed={show}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    onClick={() => setShow((s) => !s)}
                    className="absolute top-0 right-1 grid h-12 w-11 place-items-center rounded-tdfc-field text-foreground/60 hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tdfc-coral-ink"
                >
                    {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
                </button>
            }
        />
    );
}
