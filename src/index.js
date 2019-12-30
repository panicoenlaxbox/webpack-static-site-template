console.log("¡Hello World!");

document.getElementById("babel").addEventListener("click", () => {
  console.log(["Sergio", "panicoenlaxbox"].map(n => n.toUpperCase()));
});

import $ from "jquery";
import { selectric } from "selectric";
// require("selectric/public/selectric.css");

$(function() {
  $("select").selectric();
});

import * as lib from "./scripts/lib";
lib.bark();
lib.meow();

import "./scripts/jQuery.bold";
$(function() {
  $("footer").bold();
});

console.log(__("message"));
