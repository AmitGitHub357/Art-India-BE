var express = require('express');
var app = express();
// Defining all the routes
var index = require('./routes/index');
var api = require('./routes/api');
var auth = require('./routes/auth');
var client = require('./routes/client');
var artist = require('./routes/artist');
var artwork = require('./routes/artwork');
var event = require('./routes/event');
var admin = require('./routes/admin');
var volunteerProgram = require('./routes/volunteer-program');
var artistType = require('./routes/artist-type');
var artworkType = require('./routes/artwork-type');
var category = require('./routes/category');
var style = require('./routes/style');
var technique = require('./routes/technique');
var artworkFrame = require('./routes/artwork-frame');
var services = require('./routes/services');
var testimonial = require('./routes/testimonial');
var artistofyear = require('./routes/artist-of-year');
var about = require('./routes/about');
var news = require('./routes/news');
var blog = require('./routes/blog');
var comment = require('./routes/comment');
var cart = require('./routes/cart');
var search = require('./routes/search')
var education = require('./routes/education')
var gallery = require('./routes/gallery')

// Linking all the routes
app.use('/', index);
app.use('/api', api);
app.use('/auth', auth);
app.use('/client', client);
app.use('/artist', artist);
app.use('/artwork', artwork);
app.use('/event', event);
app.use('/admin', admin);
app.use('/volunteer-program', volunteerProgram);
app.use('/artist-type', artistType);
app.use('/artwork-type', artworkType);
app.use('/category', category);
app.use('/style', style);
app.use('/technique', technique);
app.use('/artwork-frame', artworkFrame);
app.use('/services', services);
app.use('/testimonial', testimonial);
app.use('/artistofyear', artistofyear);
app.use('/about', about);
app.use('/news', news);
app.use('/blog', blog);
app.use('/comment', comment);
app.use('/cart', cart);
app.use('/search', search);
app.use('/education', education);
app.use('/gallery', gallery);

module.exports = app;