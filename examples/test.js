import chalk from 'chalk';
import {Chalk} from 'chalk';

// Force a known color level so we get visible output regardless of terminal
chalk.level = 3;

// Define a theme — each key maps to a dot-separated Chalk style chain
const theme = chalk.theme({
    success: 'green.bold',
    error: 'red.bold',
    warning: 'yellow.bold',
    info: 'cyan',
    title: 'blue.bold.underline',
    // `visible` works too (the only named style without an open/close):
    cosmetic: 'visible',
});



console.log(theme.success('Operation completed'));
console.log(theme.error('Something went wrong'));
console.log(theme.warning('Be careful'));
console.log(theme.info('Server started'));
console.log(theme.title('My Application'));