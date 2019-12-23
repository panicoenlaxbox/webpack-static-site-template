require('./styles/styles.scss');

console.log('Hello World!');

document.getElementById("babel").addEventListener("click", () => {
    console.log(['Sergio', 'panicoenlaxbox'].map(n => n.toUpperCase()));
});

import $ from 'jquery';
// window.jQuery = $;
// window.$ = $;

import { selectric } from 'selectric';
require('selectric/public/selectric.css');

$(function () {    
    $("select").selectric();
});
