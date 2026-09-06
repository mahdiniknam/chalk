import test from 'ava';
import chalk, {Chalk} from '../source/index.js';

chalk.level = 3;

test('create a theme from a single style', t => {
	const theme = chalk.theme({success: 'green'});
	t.is(theme.success('Operation completed'), '\u{1B}[32mOperation completed\u{1B}[39m');
});

test('create a theme from a chained style', t => {
	const theme = chalk.theme({success: 'green.bold'});
	t.is(
		theme.success('Operation completed'),
		'\u{1B}[32m\u{1B}[1mOperation completed\u{1B}[22m\u{1B}[39m',
	);
});

test('create a theme from a deeply chained style', t => {
	const theme = chalk.theme({title: 'blue.bold.underline'});
	t.is(
		theme.title('My Application'),
		'\u{1B}[34m\u{1B}[1m\u{1B}[4mMy Application\u{1B}[24m\u{1B}[22m\u{1B}[39m',
	);
});

test('create a theme with multiple entries', t => {
	const theme = chalk.theme({
		success: 'green.bold',
		error: 'red.bold',
		warning: 'yellow.bold',
		info: 'cyan',
		title: 'blue.bold.underline',
	});

	t.is(theme.success('Operation completed'), '\u{1B}[32m\u{1B}[1mOperation completed\u{1B}[22m\u{1B}[39m');
	t.is(theme.error('Something went wrong'), '\u{1B}[31m\u{1B}[1mSomething went wrong\u{1B}[22m\u{1B}[39m');
	t.is(theme.warning('Be careful'), '\u{1B}[33m\u{1B}[1mBe careful\u{1B}[22m\u{1B}[39m');
	t.is(theme.info('Server started'), '\u{1B}[36mServer started\u{1B}[39m');
	t.is(theme.title('My Application'), '\u{1B}[34m\u{1B}[1m\u{1B}[4mMy Application\u{1B}[24m\u{1B}[22m\u{1B}[39m');
});

test('theme values accept multiple arguments joined by spaces', t => {
	const theme = chalk.theme({success: 'green'});
	t.is(theme.success('foo', 'bar'), '\u{1B}[32mfoo bar\u{1B}[39m');
});

test('theme values automatically cast non-string arguments to strings', t => {
	const theme = chalk.theme({count: 'green'});
	t.is(theme.count(123), '\u{1B}[32m123\u{1B}[39m');
});

test('theme values support falsy values', t => {
	const theme = chalk.theme({zero: 'green'});
	t.is(theme.zero(0), '\u{1B}[32m0\u{1B}[39m');
});

test('theme values return an empty string for empty input', t => {
	const theme = chalk.theme({success: 'green'});
	t.is(theme.success(), '');
});

test('theme supports background, bright, and underline colors', t => {
	const theme = chalk.theme({
		bg: 'bgRed',
		bright: 'redBright',
		ul: 'underlineRed.underlineCurly',
	});

	t.is(theme.bg('hi'), '\u{1B}[41mhi\u{1B}[49m');
	t.is(theme.bright('hi'), '\u{1B}[91mhi\u{1B}[39m');
	t.is(
		theme.ul('hi'),
		'\u{1B}[58;5;1m\u{1B}[4:3mhi\u{1B}[24m\u{1B}[59m',
	);
});

test('theme supports all alias names (gray, grey, bgGray, bgGrey)', t => {
	const theme = chalk.theme({
		gray: 'gray',
		grey: 'grey',
		bgGray: 'bgGray',
		bgGrey: 'bgGrey',
	});

	t.is(theme.gray('hi'), '\u{1B}[90mhi\u{1B}[39m');
	t.is(theme.grey('hi'), '\u{1B}[90mhi\u{1B}[39m');
	t.is(theme.bgGray('hi'), '\u{1B}[100mhi\u{1B}[49m');
	t.is(theme.bgGrey('hi'), '\u{1B}[100mhi\u{1B}[49m');
});

test('theme entries are themselves chainable builders', t => {
	const theme = chalk.theme({success: 'green'});
	// `theme.success` is a builder with the full chalk prototype, so further
	// chaining must continue to produce the expected ANSI output.
	t.is(
		theme.success.bold('extra'),
		'\u{1B}[32m\u{1B}[1mextra\u{1B}[22m\u{1B}[39m',
	);
});

test('creating a theme does not mutate the source chalk instance', t => {
	// Use a fresh Chalk instance so prior tests cannot have cached anything on it.
	const freshChalk = new Chalk();
	// Capture the set of own keys on the instance before creating a theme.
	const beforeOwnKeys = Reflect.ownKeys(freshChalk);
	freshChalk.theme({success: 'green.bold', error: 'red'});
	const afterOwnKeys = Reflect.ownKeys(freshChalk);

	t.deepEqual(afterOwnKeys, beforeOwnKeys, 'chalk instance should not gain own style properties from theme creation');
	// Spot-check that the style getters still produce fresh builders (i.e. they were never cached).
	const firstGreen = freshChalk.green;
	const secondGreen = freshChalk.green;
	t.is(typeof firstGreen, 'function');
	t.is(typeof secondGreen, 'function');
});

test('creating a theme does not cache style builders on chalk', t => {
	const freshChalk = new Chalk();
	freshChalk.theme({success: 'green.bold.underline'});
	// If theme creation cached anything on the instance, `chalk.green` would be an
	// own property (descriptor.value would be a builder rather than undefined).
	const descriptor = Object.getOwnPropertyDescriptor(freshChalk, 'green');
	t.is(descriptor, undefined);
	const boldDescriptor = Object.getOwnPropertyDescriptor(freshChalk, 'bold');
	t.is(boldDescriptor, undefined);
	const underlineDescriptor = Object.getOwnPropertyDescriptor(freshChalk, 'underline');
	t.is(underlineDescriptor, undefined);
});

test('theme creation does not affect existing chalk chaining behavior', t => {
	chalk.theme({success: 'green.bold'});
	t.is(chalk.green('foo'), '\u{1B}[32mfoo\u{1B}[39m');
	t.is(chalk.green.bold('foo'), '\u{1B}[32m\u{1B}[1mfoo\u{1B}[22m\u{1B}[39m');
	t.is(chalk.red.bgGreen.underline('foo'), '\u{1B}[31m\u{1B}[42m\u{1B}[4mfoo\u{1B}[24m\u{1B}[49m\u{1B}[39m');
});

test('two themes created from the same chalk do not interfere', t => {
	const theme1 = chalk.theme({a: 'red'});
	const theme2 = chalk.theme({b: 'blue'});

	t.is(theme1.a('x'), '\u{1B}[31mx\u{1B}[39m');
	t.is(theme2.b('y'), '\u{1B}[34my\u{1B}[39m');
	// Mutating one theme's chain does not affect the other.
	t.is(theme1.a.bold('z'), '\u{1B}[31m\u{1B}[1mz\u{1B}[22m\u{1B}[39m');
	t.is(theme2.b('y'), '\u{1B}[34my\u{1B}[39m');
});

test('a theme is reusable across many calls', t => {
	const theme = chalk.theme({success: 'green'});
	for (const value of ['one', 'two', 'three', 'four']) {
		t.is(theme.success(value), `\u{1B}[32m${value}\u{1B}[39m`);
	}
});

test('creating a new theme does not invalidate a previously created theme', t => {
	const theme1 = chalk.theme({success: 'green'});
	const theme2 = chalk.theme({info: 'cyan'});

	t.is(theme1.success('ok'), '\u{1B}[32mok\u{1B}[39m');
	t.is(theme2.info('ok'), '\u{1B}[36mok\u{1B}[39m');
	t.is(theme1.success('still ok'), '\u{1B}[32mstill ok\u{1B}[39m');
});

test('an empty theme object produces an empty theme object', t => {
	const theme = chalk.theme({});
	t.deepEqual(Object.keys(theme), []);
});

test('a theme on a custom Chalk instance respects its level', t => {
	const custom = new Chalk({level: 1});
	const theme = custom.theme({success: 'green'});

	t.is(custom.level, 1);
	t.is(theme.success('hi'), '\u{1B}[32mhi\u{1B}[39m');
});

test('a theme created from a level-0 Chalk instance emits no codes', t => {
	const custom = new Chalk({level: 0});
	const theme = custom.theme({success: 'green'});
	t.is(theme.success('hi'), 'hi');
});

test('a theme created from a level-3 Chalk instance still respects level changes', t => {
	const custom = new Chalk({level: 3});
	const theme = custom.theme({success: 'green'});

	t.is(theme.success('hi'), '\u{1B}[32mhi\u{1B}[39m');
	custom.level = 0;
	t.is(theme.success('hi'), 'hi');
});

test('the theme method is available on builders too', t => {
	const innerTheme = chalk.red.theme({strong: 'bold'});
	t.is(
		innerTheme.strong('hi'),
		'\u{1B}[31m\u{1B}[1mhi\u{1B}[22m\u{1B}[39m',
	);
});

test('theme entries can further chain via the chalk prototype', t => {
	const theme = chalk.theme({info: 'cyan'});
	// `theme.info` is a builder, so accessing `.underline` should still work
	// via the prototype getter, producing a new builder for that extension.
	t.is(
		theme.info.underline('note'),
		'\u{1B}[36m\u{1B}[4mnote\u{1B}[24m\u{1B}[39m',
	);
});

test('theme entries expose level that reads from the underlying generator', t => {
	const custom = new Chalk({level: 2});
	const theme = custom.theme({success: 'green'});
	t.is(theme.success.level, 2);
});

test('invalid style name throws a clear error', t => {
	t.throws(() => chalk.theme({foo: 'notARealStyle'}), {
		message: /Invalid Chalk style "notARealStyle"/v,
	});
});

test('invalid style name in a chained definition throws a clear error', t => {
	t.throws(() => chalk.theme({foo: 'green.notARealStyle'}), {
		message: /Invalid Chalk style "notARealStyle"/v,
	});
});

test('invalid style name in the middle of a chain throws a clear error', t => {
	t.throws(() => chalk.theme({foo: 'red.bold.notARealStyle.underline'}), {
		message: /Invalid Chalk style "notARealStyle"/v,
	});
});

test('an empty chain throws', t => {
	t.throws(() => chalk.theme({foo: ''}), {
		message: /non-empty string/v,
	});
});

test('a chain with an empty segment throws', t => {
	t.throws(() => chalk.theme({foo: 'green.'}), {
		message: /Invalid Chalk style ""/v,
	});
	t.throws(() => chalk.theme({foo: '.green'}), {
		message: /Invalid Chalk style ""/v,
	});
	t.throws(() => chalk.theme({foo: 'green..bold'}), {
		message: /Invalid Chalk style ""/v,
	});
});

test('non-string chain value throws', t => {
	t.throws(() => chalk.theme({foo: 123}), {
		message: /non-empty string/v,
	});
	t.throws(() => chalk.theme({foo: null}), {
		message: /non-empty string/v,
	});
	t.throws(() => chalk.theme({foo: undefined}), {
		message: /non-empty string/v,
	});
});

test('the theme argument must be an object', t => {
	t.throws(() => chalk.theme(null), {message: /must be an object/v});
	t.throws(() => chalk.theme('green'), {message: /must be an object/v});
	t.throws(() => chalk.theme(42), {message: /must be an object/v});
	t.throws(() => chalk.theme(), {message: /must be an object/v});
});

test('the visible modifier works inside a theme', t => {
	// `visible` with no styling emits empty at level 0 and the raw string at level > 0.
	const disabled = new Chalk({level: 0});
	const disabledTheme = disabled.theme({notice: 'visible'});
	t.is(disabledTheme.notice('hi'), '');

	const enabled = new Chalk({level: 3});
	const enabledTheme = enabled.theme({notice: 'visible'});
	t.is(enabledTheme.notice('hi'), 'hi');
});

test('theme line-break behavior matches Chalk', t => {
	const theme = chalk.theme({info: 'cyan'});
	t.is(theme.info('hello\nworld'), '\u{1B}[36mhello\u{1B}[39m\n\u{1B}[36mworld\u{1B}[39m');
});
