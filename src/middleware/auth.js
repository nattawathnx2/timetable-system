function requireAuth(req,res,next) {
    if(!req.session || !req.session.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    next();
}

function requireAdmin(req,res,next) {
    if(!req.session || !req.session.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    if(req.session.user.role !== "admin"){
        return res.status(403).json({ error: "Admin access required" });
    }

    next();
}

function validateId(req, res, next) {
    const id = req.params.id;

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            error: "Invalid ID"
        });
    }

    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    validateId
};