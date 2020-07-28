const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(cors.corsWithOptions, authenticate.verifyOrdinaryUser,(req,res,next) => {
    Favorites.find( {user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        if (favorite != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }
        else {
            err = new Error('favorite ' + req.params.favorite + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorite) => {
        if (favorite.length && favorite != null) {
            Favorites.findOneAndUpdate(
                { user: req.user._id },
                { $addToSet: { dishes: req.body } },
                { new: true,
                upsert: true}
            )
            .exec()
            .then(function(favorite) {
                res.json(favorite);
            })
            .catch(next);
        }
        else {
            Favorites.create({user: req.user._id, dishes: req.body})
            .then((favorite) => {
                console.log('leader Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.deleteOne({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:dishId');
})
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorite) => {
        if (favorite.length && favorite != null) {
            Favorites.findOneAndUpdate(
                { user: req.user._id },
                { $addToSet: { dishes: req.params.dishId} },
                { new: true,
                upsert: true}
            )
            .exec()
            .then(function(favorite) {
                res.json(favorite);
            })
            .catch(next);
        }
        else {
            Favorites.create({user: req.user._id, dishes: req.params.dishId})
            .then((favorite) => {
                console.log('leader Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOneAndUpdate(
        { user: req.user._id}, 
        { $pull: { dishes : req.params.dishId } }
    )
    .then(() => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json("Delete Dish");
    }, (err) => next(err))
    .catch((err) => next(err));
});
module.exports = favoriteRouter;