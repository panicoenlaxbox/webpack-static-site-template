require('./styles/styles.scss');

console.log('Hello World!');

document.getElementById("babel").addEventListener("click", () => {
    console.log(['Sergio', 'panicoenlaxbox'].map(n => n.toUpperCase()));
});
