import { css } from './util';

export default {
    control: {
        base: css`
            color: white;
            background: #666;
            box-sizing: border-box;
            font-family: sans-serif;
            font-size: 11px;
            user-select: none;
            transition: opacity 150ms ease-in-out, background 150ms ease-in-out;
        `,
        down: css`
            background: #444;
        `,
        toggled: css`
            background: #555;
        `,
        downToggled: css`
            background: #333;
        `,
        disabled: css`
            &.disabled {
                opacity: 0.35;
                color: #ccc;
                font-style: italic;
            }
        `
    },
};
