router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send({ status: "success", payload: req.user })
})
