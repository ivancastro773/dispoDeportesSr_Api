const db = require('../database');
const express = require('express');

exports.viewHome = (req,res) => {
    res.render('home');
 }