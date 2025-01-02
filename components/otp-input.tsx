'use client';

import React, { forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { OTPInput, SlotProps } from 'input-otp';

interface InputOtpProps {
    maxLength?: number;
    className?: string;
    disabled?: boolean;
    name?: string;
    placeholder?: string;
    defaultvalueinput?: string;
}

const InputOtp = forwardRef<HTMLInputElement, InputOtpProps>(
    ({ maxLength = 8, className, disabled, ...props }, ref) => {
        const inputRef = ref ? ref : React.createRef<HTMLInputElement>();
        const [value, setValue] = React.useState('');
        useEffect(() => {
            if (props.defaultvalueinput && inputRef) {
                const input = inputRef as React.RefObject<HTMLInputElement>;
                const inputElement = input.current;
                if (inputElement) {
                    setValue(props.defaultvalueinput);
                }
            }
        }, [props.defaultvalueinput, inputRef]);
        return (
            <OTPInput
                ref={inputRef}
                {...props}
                name={props.name}
                onChangeCapture={(e) => {
                    setValue(e.currentTarget.value);
                }}
                value={value}
                placeholder={props.placeholder}
                disabled={disabled}
                autoFocus={true}
                containerClassName={cn(
                    'flex items-center gap-3',
                    disabled && 'opacity-50',
                    className,
                )}
                maxLength={maxLength}
                render={({ slots }: { slots: SlotProps[] }) => (
                    <div className="flex">
                        {slots.map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                        ))}
                    </div>
                )}
            />
        );
    },
);

function Slot(props: SlotProps) {
    return (
        <div
            className={cn(
                'relative -ms-px flex size-9 items-center justify-center border border-input bg-background font-medium text-foreground shadow-sm shadow-black/5 transition-shadow first:ms-0 first:rounded-s-lg last:rounded-e-lg',
                { 'z-10 border border-ring ring-[3px] ring-ring/20': props.isActive },
            )}
        >
            {props.char !== null && <div>{props.char}</div>}
        </div>
    );
}

InputOtp.displayName = 'InputOtp';
export default InputOtp;
