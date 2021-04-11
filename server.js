const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server/lib/Server');
const webpackConfig = require('./webpack.config');

const compiler = Webpack(webpackConfig);
const devServerOptions = Object.assign({}, webpackConfig.devServer);
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(5500, '127.0.0.1', () => {
	console.log('Starting server on http://localhost:5500');
});

// Disable the deployed gadget version when we begin our testing,
// enable it back again when we stop testing.
// You need to create a credentials.json file (it will be git-ignored)
// with content:
/*
Using a bot password (set one up using [[Special:BotPasswords]]:
 	{ "apiUrl": "", "silent": true, "username": "", "password": "" }
OR using OAuth:
    { "apiUrl": "", "OAuthCredentials": {"consumerToken": "", "consumerSecret": "", "accessToken": "", "accessSecret": "" } }
 */
(async () => {
	const { mwn } = require('mwn');
	let user;
	try {
		user = await mwn.init('./credentials.json');
	} catch (e) {
		if (e instanceof mwn.Error) {
			console.log(`[mwn]: can't disable twinkle as gadget: login failure: ${e}`);
			console.log(e.stack);
		}
		return;
	}
	await user.saveOption('gadget-Twinkle', '0').then(() => {
		console.log('[i] Disabled twinkle as gadget.');
	});

	// Allow async operations in exit hook
	process.stdin.resume();

	// Catch ^C
	process.on('SIGINT', async () => {
		try {
			await user.saveOption('gadget-Twinkle', '1');
			console.log('[i] Re-enabled twinkle as gadget.');
		} catch (e) {
			console.log(`[i] failed to re-enable twinkle gadget: ${e}`);
			console.log(e.stack);
		} finally {
			process.exit();
		}
	});
})();