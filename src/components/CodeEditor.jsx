import React, {useState, useRef, useEffect} from 'react';
import './CodeEditor.scss';

export default function CodeEditor() {
    const [value, setValue] = useState(`
// Welcome to the Code Editor!

/* I am still working on a few of the quirks here and there, but feel free to try it out!
Syntax highlighting is currently set to JavaScript. */

const name = {
    first: 'Alex',
    last: 'Pak'
};

function getName() {
    if (name.first && name.last) {
        return \`\${name.first} \${name.last}\`;
    }
    else return false;
};

getName();
// Alex Pak
    `);
    const [inputTimeout, setInputTimeout] = useState(null);

    const [scrollHeight, setScrollHeight] = useState(0);
    useEffect(() => {
        preEl.current.scrollTop = scrollHeight;
    }, [scrollHeight]);

    const [caretPosition, setCaretPosition] = useState(0);
    useEffect(() => {
        textareaEl.current.setSelectionRange(caretPosition, caretPosition);
        // setLinePosition(textareaEl.current.value.slice(0, caretPosition).split('\n').length);
    }, [caretPosition]);

    // const [linePosition, setLinePosition] = useState(null);

    const preEl = useRef(null);
    const textareaEl = useRef(null);

    const inputDebounce = (func, timeout) => {
        clearTimeout(inputTimeout);
        setInputTimeout(setTimeout(() => {
            func()
        }, timeout));
    };

    const handleChange = ({target}) => {
        const {value} = target;
        setValue(value);
    };

    const handleKeyDown = (e) => {
        const {key, target} = e;
        const {selectionStart} = target;
        setCaretPosition(selectionStart);
        if (key === 'Tab') {
            e.preventDefault();
            const tabCount = 4;
            const tab = new Array(tabCount).fill(' ').join('');
            const valueArray = value.split('');
            valueArray.splice(selectionStart, 0, tab);
            const valueWithTab = valueArray.join('');
            setValue(valueWithTab);
            setCaretPosition(selectionStart + tabCount);
        };
    };

    const handleTextareaScroll = ({target}) => {
        const textAreaScrollHeight = target.scrollTop;
        setScrollHeight(textAreaScrollHeight);
    };

    const handlePreScroll = (e) => {
        e.preventDefault();
    };

    const handleMouseUp = ({target}) => {
        inputDebounce(() => {
            const {selectionStart, selectionEnd} = target;
            if (selectionStart === selectionEnd) 
                setCaretPosition(selectionEnd);
            
        }, 0);
    };

    const handleMouseDown = ({target}) => {
        inputDebounce(() => {
            const {selectionStart, selectionEnd} = target;
            if (selectionStart === selectionEnd) 
                setCaretPosition(selectionStart);
            
        }, 0);
    };

    const LANG_REGEX = {
        js: /(?<basic>function|let|var|const|true|false)|(?<other>return|null|import|export|default|if|else)|(?<string>"[^"\n]*"|"[^"\n]*|'[^'\n]*'|'[^'\n]*|(`[^`]*`|`[^`]*))|(?<constant>(?<=const )\w+)|(?<variable>(?<=let\s|var\s)\w+)|(?<comment>\/\/[^\n]*|\/\*[^*/]*\*\/|\/\*[^*/]*)|(?<number>\d+)|(?<method>(?<=function )\w+(?=\(*))/
    };

    const parsedCode = getParsedCodeFromString(value, LANG_REGEX.js);

    function getParsedCodeFromString(string, regex) {
        const matches = [...string.matchAll(new RegExp(regex, 'g'))].map(match => {
            return {
                keyword: match[0],
                startIndex: match.index,
                lastIndex: match[0].length + match.index,
                input: match.input,
                group: Object.entries(match.groups).filter(group => group.every(item => !!item))[0][0]
            };
        });

        let lastVisitedIndex = null;
        let output = [];

        matches.forEach((match, index, array) => {
            const {
                keyword,
                startIndex,
                lastIndex,
                input,
                group
            } = match;
            const lastArrayIndex = array.length - 1;

            const element = group ? <code className={
                    `js-reserved ${group}`
                }
                key={
                    `${group}-${index}`
            }>
                {keyword}</code> : keyword;

            if (index === 0 && startIndex === 0 && index !== lastArrayIndex) {
                output.push([element]);
            } else if (index === 0 && startIndex > 0) {
                output.push([
                    input.slice(0, startIndex),
                    element
                ]);
            } else if (index < lastArrayIndex && lastVisitedIndex < startIndex) {
                output.push([
                    input.slice(lastVisitedIndex, startIndex),
                    element
                ]);
            } else if (index === lastArrayIndex && lastIndex < input.length) {
                output.push([
                    input.slice(lastVisitedIndex, startIndex),
                    element,
                    input.slice(lastIndex, input.length)
                ]);
            } else if (index === lastArrayIndex && lastIndex === input.length) {
                output.push([
                    input.slice(lastVisitedIndex, startIndex),
                    element
                ]);
            } else {
                console.error('Something is wrong...');
            };
            lastVisitedIndex = lastIndex;
        });
        return output;
    };

    return (
        <div id='formattedCode'>
            <textarea onKeyDown={handleKeyDown}
                onChange={handleChange}
                onScroll={handleTextareaScroll}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                value={value}
                spellCheck={false}
                ref={textareaEl}></textarea>
            <pre
                ref={preEl}
                onScroll={handlePreScroll}
            >
                {parsedCode}
            </pre>
        </div>
    );
};
