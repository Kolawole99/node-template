const glob = require('glob');
const { resolve } = require('path');

module.exports.loadEventSystem = () => {
    const basePath = resolve(__dirname, '.');
    const files = glob.sync('*.js', { cwd: basePath });
    files.forEach((file) => {
        if (file.toLocaleLowerCase().includes('_config')) return;
        // eslint-disable-next-line
        require(resolve(basePath, file));
    });
};
