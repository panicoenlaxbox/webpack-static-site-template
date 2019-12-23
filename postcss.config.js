module.exports = ({ file, options, env }) => ({
    plugins: {
        'autoprefixer': true,
        'cssnano': env === 'production' ? options.cssnano : false
    }
});