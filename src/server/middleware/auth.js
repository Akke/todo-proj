"use strict";

const auth = (req, res, next) => {
    if (!req.session.passport) {
        return res.redirect("/")
    }
    next()
}

export default auth