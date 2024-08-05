import React, { ChangeEvent, HTMLProps } from 'react';

type Allowed = string | number;

interface IProps<T> extends HTMLProps<HTMLSelectElement> {
    options: T[];
    placeholder: string;
    mapOptionToLabel: (option: T) => Allowed;
    onSelectChange: (option: T) => void;
}

export function Select<T>({
    options,
    placeholder,
    mapOptionToLabel,
    onSelectChange,
    ...restProps
}: IProps<T>) {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(event.target.value, 10);
        if (index < 0) return;

        onSelectChange(options[index]);
    };

    const toLabel = (option: T): Allowed => {
        if (mapOptionToLabel) {
            return mapOptionToLabel(option);
        }
        return '';
    };

    return (
        <div>
            <select {...restProps} onChange={handleChange}>
                <option value="" disabled>
                    {placeholder ?? 'Select an option'}
                </option>
                {options.map((option, i) => (
                    <option key={i} value={i}>
                        {toLabel(option)}
                    </option>
                ))}
            </select>
        </div>
    );
}
